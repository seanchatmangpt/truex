import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { RecursiveHookEngine, TopologyRefusalError } from '../../src/manufacturing/topology.js';
import { TransactionalMembrane } from '../../src/persistence/transactions.js';
import { initializeSchema } from '../../src/persistence/schema.js';
import { createDeterministicContext } from '../../src/context.js';
import { TruexHook } from '../../src/hook.js';
import type { GraphDelta, HookDefinition, Receipt } from '../../src/runtime-law.js';

describe('Topology Rollback and Storm Protection Tests', () => {
  let db: Database.Database;
  let ctx: any;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    ctx = createDeterministicContext(100);
  });

  it('1. If Hook B fails, Hook C does not execute', async () => {
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-A', object: 'o', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'trigger-A' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-B', object: 'o', graph: null } }]
    });

    let hookCExecuted = false;

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'trigger-B' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-C', object: 'o', graph: null } }]
    });

    const hookC = new TruexHook({
      id: 'hook-C',
      name: 'Hook C',
      condition: { kind: 'delta-match', predicate: 'trigger-C' },
      effects: [{ kind: 'emit-event', type: 'event-C' }]
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      if (hookC.matches(d)) matched.push(hookC);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      if (h.definition.id === 'hook-B') {
        throw new Error('Hook B failure');
      }
      if (h.definition.id === 'hook-C') {
        hookCExecuted = true;
      }
      return h.execute(ctx, d, prevHash);
    };

    await expect(engine.process(rootDelta, pullHooks, execute)).rejects.toThrow('Hook hook-B failed: Hook B failure');
    expect(hookCExecuted).toBe(false);
  });

  it('2. If Hook B fails, Hook A consequence is rolled back or marked compensated', async () => {
    const targetState = { count: 0 };
    const membrane = new TransactionalMembrane(db, targetState, { ctx });
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-A', object: 'o', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'trigger-A' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-B', object: 'o', graph: null } }]
    });

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'trigger-B' },
      effects: []
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      return matched;
    };

    membrane.begin();
    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      if (h.definition.id === 'hook-A') {
        membrane.proxy.count += 10;
        return h.execute(ctx, d, prevHash);
      }
      if (h.definition.id === 'hook-B') {
        throw new Error('Hook B Failure');
      }
      return h.execute(ctx, d, prevHash);
    };

    let capturedTopology;
    try {
      await engine.process(rootDelta, pullHooks, execute);
      membrane.commit();
    } catch (error: any) {
      membrane.rollback();
      if (error instanceof TopologyRefusalError) {
        capturedTopology = error.topology;
      }
    }

    // Prove Hook A consequence rolled back in TransactionalMembrane
    expect(membrane.proxy.count).toBe(0);

    // Prove Hook A was marked compensated in the topology activations
    expect(capturedTopology).toBeDefined();
    const activations = capturedTopology!.activations;
    
    // Topology should have:
    // 1. Hook A (confirmed)
    // 2. Hook B (refused due to execution failure)
    // 3. Hook A (rollback receipt)
    expect(activations).toHaveLength(3);
    
    const rollbackAct = activations[2];
    expect(rollbackAct.hookId).toBe('hook-A');
    expect(rollbackAct.receipt.status).toBe('refused');
    expect(rollbackAct.receipt.rollbackOf).toBe(activations[0].id);
  });

  it('3. Rollback emits rollback receipt', async () => {
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-A', object: 'o', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'trigger-A' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-B', object: 'o', graph: null } }]
    });

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'trigger-B' },
      effects: []
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      if (h.definition.id === 'hook-B') {
        throw new Error('Hook B Failure');
      }
      return h.execute(ctx, d, prevHash);
    };

    try {
      await engine.process(rootDelta, pullHooks, execute);
      expect.fail('Should have thrown TopologyRefusalError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(TopologyRefusalError);
      const topology = error.topology;
      expect(topology).toBeDefined();
      
      const activations = topology.activations;
      const rollbackActivation = activations.find((a: any) => a.receipt.eventId.startsWith('evt_rollback_'));
      expect(rollbackActivation).toBeDefined();
      expect(rollbackActivation!.receipt.status).toBe('refused');
      expect(rollbackActivation!.receipt.receiptHash).toBeDefined();
    }
  });

  it('4. Rollback lineage references failed child', async () => {
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-A', object: 'o', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'trigger-A' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-B', object: 'o', graph: null } }]
    });

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'trigger-B' },
      effects: []
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      if (h.definition.id === 'hook-B') {
        throw new Error('Hook B Failure');
      }
      return h.execute(ctx, d, prevHash);
    };

    try {
      await engine.process(rootDelta, pullHooks, execute);
      expect.fail('Should have thrown TopologyRefusalError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(TopologyRefusalError);
      const topology = error.topology;
      const activations = topology.activations;
      
      const failedChildAct = activations[1]; // Hook B
      const rollbackAct = activations[2]; // Hook A Rollback
      
      expect(rollbackAct.receipt.failedChildId).toBe(failedChildAct.receipt.id);
      expect(rollbackAct.receipt.previousReceiptHash).toBe(failedChildAct.receipt.receiptHash);
    }
  });

  it('5. Cyclic A -> B -> A hook storm is detected', async () => {
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 'ping', predicate: 'loop:ping', object: 'ping', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'loop:ping' },
      effects: [{ kind: 'add-quad', quad: { subject: 'pong', predicate: 'loop:pong', object: 'pong', graph: null } }]
    });

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'loop:pong' },
      effects: [{ kind: 'add-quad', quad: { subject: 'ping', predicate: 'loop:ping', object: 'ping', graph: null } }]
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    await expect(engine.process(rootDelta, pullHooks, execute)).rejects.toThrow(
      'Cyclic hook storm detected: Hook hook-A is already in the execution path'
    );
  });

  it('6. Hook storm emits refused receipt', async () => {
    const engine = new RecursiveHookEngine(ctx, { refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 'ping', predicate: 'loop:ping', object: 'ping', graph: null }],
      deletes: []
    };

    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Hook A',
      condition: { kind: 'delta-match', predicate: 'loop:ping' },
      effects: [{ kind: 'add-quad', quad: { subject: 'pong', predicate: 'loop:pong', object: 'pong', graph: null } }]
    });

    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Hook B',
      condition: { kind: 'delta-match', predicate: 'loop:pong' },
      effects: [{ kind: 'add-quad', quad: { subject: 'ping', predicate: 'loop:ping', object: 'ping', graph: null } }]
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hookA.matches(d)) matched.push(hookA);
      if (hookB.matches(d)) matched.push(hookB);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    try {
      await engine.process(rootDelta, pullHooks, execute);
      expect.fail('Should have thrown TopologyRefusalError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(TopologyRefusalError);
      expect(error.receipt.status).toBe('refused');
      expect(error.receipt.reason).toContain('Cyclic hook storm detected');
      
      const topology = error.topology;
      expect(topology).toBeDefined();
      const activations = topology.activations;
      expect(activations[2].receipt.status).toBe('refused');
      expect(activations[2].receipt.reason).toContain('Cyclic hook storm detected');
    }
  });

  it('7. Max depth breach is refused', async () => {
    const engine = new RecursiveHookEngine(ctx, { maxDepth: 2, refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-1', object: 'o', graph: null }],
      deletes: []
    };

    const hook1 = new TruexHook({
      id: 'hook-1',
      name: 'Hook 1',
      condition: { kind: 'delta-match', predicate: 'trigger-1' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-2', object: 'o', graph: null } }]
    });

    const hook2 = new TruexHook({
      id: 'hook-2',
      name: 'Hook 2',
      condition: { kind: 'delta-match', predicate: 'trigger-2' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-3', object: 'o', graph: null } }]
    });

    const hook3 = new TruexHook({
      id: 'hook-3',
      name: 'Hook 3',
      condition: { kind: 'delta-match', predicate: 'trigger-3' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-4', object: 'o', graph: null } }]
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hook1.matches(d)) matched.push(hook1);
      if (hook2.matches(d)) matched.push(hook2);
      if (hook3.matches(d)) matched.push(hook3);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    try {
      await engine.process(rootDelta, pullHooks, execute);
      expect.fail('Should have failed');
    } catch (error: any) {
      expect(error).toBeInstanceOf(TopologyRefusalError);
      expect(error.message).toContain('Max depth breach');
      
      const topology = error.topology;
      const activations = topology.activations;
      expect(activations[2].hookId).toBe('depth-breach-refusal');
      expect(activations[2].receipt.status).toBe('refused');
      expect(activations[2].receipt.reason).toContain('Max depth breach');
    }
  });

  it('8. Max emitted-delta count breach is refused', async () => {
    const engine = new RecursiveHookEngine(ctx, { maxEmittedDeltas: 2, refuseOnBreach: true });

    const rootDelta: GraphDelta = {
      id: 'delta-root',
      adds: [{ subject: 's', predicate: 'trigger-1', object: 'o', graph: null }],
      deletes: []
    };

    const hook1 = new TruexHook({
      id: 'hook-1',
      name: 'Hook 1',
      condition: { kind: 'delta-match', predicate: 'trigger-1' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-2', object: 'o', graph: null } }]
    });

    const hook2 = new TruexHook({
      id: 'hook-2',
      name: 'Hook 2',
      condition: { kind: 'delta-match', predicate: 'trigger-2' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-3', object: 'o', graph: null } }]
    });

    const hook3 = new TruexHook({
      id: 'hook-3',
      name: 'Hook 3',
      condition: { kind: 'delta-match', predicate: 'trigger-3' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'trigger-4', object: 'o', graph: null } }]
    });

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hook1.matches(d)) matched.push(hook1);
      if (hook2.matches(d)) matched.push(hook2);
      if (hook3.matches(d)) matched.push(hook3);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    try {
      await engine.process(rootDelta, pullHooks, execute);
      expect.fail('Should have failed');
    } catch (error: any) {
      expect(error).toBeInstanceOf(TopologyRefusalError);
      expect(error.message).toContain('Max emitted-delta count breach');
      
      const topology = error.topology;
      const activations = topology.activations;
      
      // We expect the breach activation to be delta-breach-refusal
      const breachActivation = activations.find((a: any) => a.hookId === 'delta-breach-refusal');
      expect(breachActivation).toBeDefined();
      expect(breachActivation!.receipt.status).toBe('refused');
      expect(breachActivation!.receipt.reason).toContain('Max emitted-delta count breach');
    }
  });
});
