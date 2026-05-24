import type { Database } from 'better-sqlite3';

export interface OntologyNode {
  id: string; // The file path relative to project root
  type: string;
  layer: string; // e.g., S0, S1, S2, S3, S4, S5
  dependencies: string[]; // List of file paths this file depends on
  provedBy: string[]; // List of test files that import this file
  documentedBy: string[]; // List of observatory emitters that process this file
}

export class OntologyRegistry {
  constructor(private db: Database) {}

  upsertNode(node: OntologyNode): void {
    const stmt = this.db.prepare(`
      INSERT INTO ontology (id, type, layer, deps)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        type = excluded.type,
        layer = excluded.layer,
        deps = excluded.deps
    `);
    
    stmt.run(
      node.id, 
      node.type, 
      node.layer, 
      JSON.stringify({
        dependencies: node.dependencies,
        provedBy: node.provedBy,
        documentedBy: node.documentedBy
      })
    );
  }

  isOrphaned(filePath: string): boolean {
    const stmt = this.db.prepare('SELECT id FROM ontology WHERE id = ?');
    const row = stmt.get(filePath);
    return !row;
  }

  getRole(filePath: string): Pick<OntologyNode, 'type' | 'layer'> | null {
    const stmt = this.db.prepare('SELECT type, layer FROM ontology WHERE id = ?');
    const row = stmt.get(filePath) as { type: string, layer: string } | undefined;
    if (!row) return null;
    return { type: row.type as any, layer: row.layer };
  }

  getOrphans(actualFiles: string[]): string[] {
    const orphans: string[] = [];
    for (const file of actualFiles) {
      if (this.isOrphaned(file)) {
        orphans.push(file);
      }
    }
    return orphans;
  }

  getAllNodes(): OntologyNode[] {
    const stmt = this.db.prepare('SELECT id, type, layer, deps FROM ontology');
    const rows = stmt.all() as { id: string, type: string, layer: string, deps: string }[];
    return rows.map(r => {
      const parsedDeps = JSON.parse(r.deps);
      return {
        id: r.id,
        type: r.type as any,
        layer: r.layer,
        dependencies: Array.isArray(parsedDeps) ? parsedDeps : (parsedDeps.dependencies || []),
        provedBy: Array.isArray(parsedDeps) ? [] : (parsedDeps.provedBy || []),
        documentedBy: Array.isArray(parsedDeps) ? [] : (parsedDeps.documentedBy || [])
      };
    });
  }
}
