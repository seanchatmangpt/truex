import type { Database } from 'better-sqlite3';
import { SQLiteReceiptStore } from '../persistence/receipt-store.js';
import { AndonSystem } from '../manufacturing/jidoka.js';

export class JidokaController {
  private receiptStore: SQLiteReceiptStore;

  constructor(
    private db: Database,
    private andon: AndonSystem
  ) {
    this.receiptStore = new SQLiteReceiptStore(db);
  }

  /**
   * Enforces ontology correctness. If an unmapped pathway is hit,
   * it triggers an immediate line stop and process exit.
   */
  assertOntologyMapping(filePath: string, actualFiles: string[]): void {
    const isUnmapped = !actualFiles.includes(filePath);
    
    if (isUnmapped) {
      const reason = `UNMAPPED_ONTOLOGY_NODE: File path "${filePath}" is not registered in the Gall Ontology schema.`;
      
      // Pull Andon Cord
      this.andon.stopLine(reason);

      // Write Refused Receipt to Persistence Membrane
      try {
        // Construct a unique receipt for this refusal
        const time = Date.now();
        this.receiptStore.append({
          id: `refused-onto-${time}`,
          eventId: 'evt-ontology-violation',
          deltaId: `delta-violation-${filePath.replace(/\//g, '_')}`,
          inputHash: 'hash-violator',
          outputHash: 'hash-refused',
          previousReceiptHash: null,
          status: 'refused',
          receiptHash: `viol-hash-${time}`
        });
      } catch (storeError) {
        console.error('CRITICAL: Failed to write refusal receipt to SQLite:', storeError);
      }

      // Print error message and trigger Jidoka Line Stop (Exit Code 1)
      console.error(`\n[JIDOKA LINE STOP] ${reason}`);
      process.exit(1);
    }
  }

  /**
   * Enforces FOSSIL invariants (immutability check).
   */
  assertFossilOperation(targetField: string, isForbidden: boolean): void {
    if (isForbidden) {
      const reason = `ILLEGAL_FOSSIL_MUTATION: Mutation to forbidden target field "${targetField}" rejected.`;
      this.andon.stopLine(reason);
      
      // Write Refused Receipt to Persistence Membrane
      try {
        const time = Date.now();
        this.receiptStore.append({
          id: `refused-fossil-${time}`,
          eventId: 'evt-fossil-violation',
          deltaId: `delta-fossil-${targetField}`,
          inputHash: 'hash-fossil-violator',
          outputHash: 'hash-refused',
          previousReceiptHash: null,
          status: 'refused',
          receiptHash: `fossil-viol-hash-${time}`
        });
      } catch (storeError) {
        console.error('CRITICAL: Failed to write refusal receipt to SQLite:', storeError);
      }

      console.error(`\n[JIDOKA LINE STOP] ${reason}`);
      process.exit(1);
    }
  }
}
