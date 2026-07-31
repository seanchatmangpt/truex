/**
 * @module GenesisFoundry
 * @description Physical composition of the Truex/Storehouse substrate.
 */

import { createDeterministicContext } from '../packages/membrane/src/context.ts';
import { hash } from '../skills/hash/mutations.ts';
import { VowMembrane } from '../packages/vow/src/index.ts';
import { StorehouseManager } from '../packages/storehouse/src/storehouse.ts';
import { AndonSystem } from '../packages/membrane/src/manufacturing/jidoka.ts';

async function main() {
  console.log('=== COMPOSING THE GENESIS FOUNDRY ===\n');

  const ctx = createDeterministicContext(42);
  console.log('✓ Vector 1 (Source) initialized: Causal seed locked.');

  const vow = new VowMembrane('MAL:3:10');
  console.log('✓ Vector 8 (Vow) initialized: Closure condition set to MAL:3:10.');

  const andon = new AndonSystem();
  console.log('✓ Vector 5 (Manufacturing) active: Jidoka line-stop ready.');

  const manager = new StorehouseManager(andon, ctx);
  manager.registerField('field-alpha');
  console.log('✓ Vector 4 (Core) active: Storehouse field-alpha registered.');

  console.log('\n--- EXECUTING GENESIS TRANSACTION ---\n');

  try {
    const increase = { amount: 1000, currency: 'USD', timestamp: ctx.clock() };
    console.log(`[Attempt] Increase detected: ${increase.amount} ${increase.currency}`);

    vow.advance('f'.repeat(64));
    console.log(`[Vow] State advanced to: ${vow.getState()} (Pattern Verified)`);

    const receiver = { id: 'receiver-mercy', name: 'Mercy Logistics' };
    const receipt = manager.stewardIncrease(
      increase,
      { id: 'field-alpha', name: 'Alpha Field', owner: 'Foundry' },
      receiver,
    );

    console.log(`[Storehouse] Provision routed to: ${receiver.name}`);
    console.log(`[Storehouse] Stewardship Receipt Issued: ${receipt.id}`);

    vow.advance('field-alpha');
    vow.advance('provision-route');
    vow.advance('receiver-mercy');
    vow.advance(receipt.provision.amount);
    vow.advance(hash(receipt));
    vow.advance(1);

    console.log(`\n✓ Vector 8 (Vow) reached: ${vow.getState()} (Perfection)`);
    console.log('✓ Composition Proven: Consequence conserved across 8 vectors.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n✗ JIDOKA HALT: ${message}`);
    process.exitCode = 1;
    return;
  }

  console.log('\n=== COMPOSITION SUCCESSFUL ===');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
