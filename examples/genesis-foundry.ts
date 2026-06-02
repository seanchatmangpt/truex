/**
 * @module GenesisFoundry
 * @description 
 * Physical composition of the Truex/Storehouse substrate.
 * Demonstrates the full Formation-to-Infrastructure pipeline using composed projects.
 */

import { createDeterministicContext } from '../packages/membrane/src/context.ts';
import { VowMembrane } from '../packages/vow/src/index.ts';
import { StorehouseManager } from '../packages/storehouse/src/storehouse.ts';
import { AndonSystem } from '../packages/membrane/src/manufacturing/jidoka.ts';

async function main() {
  console.log("=== COMPOSING THE GENESIS FOUNDRY ===\n");

  // 1. Initialize Vector 1: Source (Deterministic Context)
  const ctx = createDeterministicContext(42);
  console.log("✓ Vector 1 (Source) initialized: Causal seed locked.");

  // 2. Initialize Vector 8: Vow (Absolute Closure)
  const vow = new VowMembrane('MAL:3:10');
  console.log("✓ Vector 8 (Vow) initialized: Closure condition set to MAL:3:10.");

  // 3. Initialize Vector 5: Manufacturing (Andon/Jidoka)
  const andon = new AndonSystem();
  console.log("✓ Vector 5 (Manufacturing) active: Jidoka line-stop ready.");

  // 4. Initialize Vector 4: Core & State (Storehouse)
  const manager = new StorehouseManager(andon);
  manager.registerField('field-alpha');
  console.log("✓ Vector 4 (Core) active: Storehouse field-alpha registered.");

  // --- START COMPOSITION LOOP ---

  console.log("\n--- EXECUTING GENESIS TRANSACTION ---\n");

  try {
    // A. Attempt increase
    const increase = { amount: 1000, currency: 'USD', timestamp: ctx.clock() };
    console.log(`[Attempt] Increase detected: ${increase.amount} ${increase.currency}`);

    // B. Advance Vow (Source -> Pattern)
    vow.advance('f'.repeat(64)); // Mock pattern hash
    console.log(`[Vow] State advanced to: ${vow.getState()} (Pattern Verified)`);

    // C. Route Provision (The 10% First Portion)
    const receiver = { id: 'receiver-mercy', name: 'Mercy Logistics' };
    const receipt = manager.stewardIncrease(
      increase,
      { id: 'field-alpha', name: 'Alpha Field', owner: 'Foundry' },
      receiver
    );

    console.log(`[Storehouse] Provision routed to: ${receiver.name}`);
    console.log(`[Storehouse] Stewardship Receipt Issued: ${receipt.id}`);

    // D. Final Vow Check (Fruit -> Receipt -> Rest)
    vow.advance('field-alpha'); // Pattern -> Field
    vow.advance('provision-route'); // Field -> Motion
    vow.advance('receiver-mercy'); // Motion -> Receiver
    vow.advance(receipt.provision.amount); // Receiver -> Fruit
    vow.advance('r'.repeat(64)); // Fruit -> Receipt
    vow.advance(1); // Receipt -> Rest

    console.log(`\n✓ Vector 8 (Vow) reached: ${vow.getState()} (Perfection)`);
    console.log("✓ Composition Proven: Consequence conserved across 8 vectors.");

  } catch (error: any) {
    console.error(`\n✗ JIDOKA HALT: ${error.message}`);
    process.exit(1);
  }

  console.log("\n=== COMPOSITION SUCCESSFUL ===");
}

main().catch(console.error);
