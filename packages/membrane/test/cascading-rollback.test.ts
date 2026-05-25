import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { TransactionalMembrane } from '../src/persistence/transactions.js';
import { AndonSystem, PokaYoke } from '../src/manufacturing/jidoka.js';
import { TruexHook } from '../src/hook.js';
import { createDeterministicContext } from '../src/context.js';
import { initializeSchema } from '../src/persistence/schema.js';

describe('Cascading Rollback Reproduction', () => {
  let db: Database.Database;
  let membrane: TransactionalMembrane<any>;
  let andon: AndonSystem;
  let pokaYoke: PokaYoke;
  const ctx = createDeterministicContext(1);

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    const target = { count: 0 };
    membrane = new TransactionalMembrane(db, target, { ctx });
    andon = new AndonSystem();
    pokaYoke = new PokaYoke(andon);
  });

  it('demonstrates that currently, successful hooks in a chain are NOT rolled back if a later hook fails', () => {
    const hook1 = new TruexHook({
      id: 'hook1',
      name: 'Hook 1',
      condition: { kind: 'delta-match', predicate: 'trigger1' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'p', object: 'o1' } }]
    });

    const hook2 = new TruexHook({
      id: 'hook2',
      name: 'Hook 2',
      condition: { kind: 'delta-match', predicate: 'trigger2' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'p', object: 'o2' } }]
    });

    const delta1 = { id: 'd1', adds: [{ subject: 'x', predicate: 'trigger1', object: 'y' }], deletes: [] };
    const delta2 = { id: 'd2', adds: [{ subject: 'x', predicate: 'trigger2', object: 'y' }], deletes: [] };

    // Execute Hook 1
    membrane.execute(ctx, delta1, hook1);
    expect(membrane.proxy.count).toBe(0); // count wasn't changed by effects because effects are static in this mock
    
    // Let's manually change state in hook execution to simulate state changes
    const originalExecute = hook1.execute.bind(hook1);
    hook1.execute = (c, d, p) => {
      membrane.proxy.count += 1;
      return originalExecute(c, d, p);
    };

    const originalExecute2 = hook2.execute.bind(hook2);
    hook2.execute = (c, d, p) => {
      membrane.proxy.count += 10;
      throw new Error('H2 Failed');
    };

    // Chain: H1 -> H2 (fails)
    
    // Step 1: H1 succeeds
    membrane.execute(ctx, delta1, hook1);
    expect(membrane.proxy.count).toBe(1);
    
    // Step 2: H2 fails
    expect(() => membrane.execute(ctx, delta2, hook2)).toThrow('H2 Failed');
    
    // CURRENT BEHAVIOR: H1 state remains committed!
    expect(membrane.proxy.count).toBe(1); 
    // We want it to be 0 after H2 fails if they were in the same chain.
  });
});
