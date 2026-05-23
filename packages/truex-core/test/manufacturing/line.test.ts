import { describe, it, expect, vi, beforeEach } from 'vitest';
import { truexManufacture, ProductionLine } from '../../src/manufacturing/line.js';
import { createDeterministicContext } from '../../src/context.js';
import { HookDefinition, GraphDelta } from '../../src/runtime-law.js';
import { TruexHook } from '../../src/hook.js';

describe('ProductionLine (Integration)', () => {
  const mockContext = createDeterministicContext(12_345);

  const sampleHook: HookDefinition = {
    id: 'test-hook',
    name: 'Sample Hook',
    condition: { kind: 'delta-match', predicate: 'test-predicate' },
    effects: [{ kind: 'emit-event', type: 'test-event' }],
  };

  it('integrates JIT pulling (Kanban)', () => {
    const line = truexManufacture(mockContext, [sampleHook]);
    
    const delta: GraphDelta = {
      id: 'd1',
      adds: [{ subject: 's', predicate: 'test-predicate', object: 'o' }],
      deletes: []
    };

    const results = line.manufacture(delta);
    expect(results).toHaveLength(1);
    expect(results[0].hookId).toBe('test-hook');
  });

  it('applies Jidoka (Poka-yoke) and stops line on error', () => {
    const errorHookDef: HookDefinition = {
      id: 'error-hook',
      name: 'Error Hook',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'error-event' }],
    };

    const line = truexManufacture(mockContext, [errorHookDef]);
    const delta: GraphDelta = { id: 'd2', adds: [], deletes: [] };

    // We need to spy on the hook's execute method. 
    // Since ProductionLine creates its own TruexHook instances, we can spy on the prototype.
    const spy = vi.spyOn(TruexHook.prototype, 'execute').mockImplementationOnce(() => {
      throw new Error('Station Malfunction');
    });

    expect(() => line.manufacture(delta)).toThrow('Station Malfunction');
    
    // Subsequent manufacture should fail due to line stop (Andon)
    expect(() => line.manufacture(delta)).toThrow(/Jidoka LineStop/);
    
    spy.mockRestore();
  });

  it('supports Heijunka (Leveled Manufacturing)', async () => {
    const line = truexManufacture(mockContext, [sampleHook], { batchSize: 2 });
    
    const deltas: GraphDelta[] = [
      { id: 'd1', adds: [{ subject: 's', predicate: 'test-predicate', object: 'o' }], deletes: [] },
      { id: 'd2', adds: [{ subject: 's', predicate: 'test-predicate', object: 'o' }], deletes: [] },
      { id: 'd3', adds: [{ subject: 's', predicate: 'test-predicate', object: 'o' }], deletes: [] },
    ];

    const results = await line.manufactureLeveled(deltas);
    expect(results).toHaveLength(3);
  });

  it('provides Gemba visibility', () => {
    const line = truexManufacture(mockContext, [sampleHook]);
    const delta: GraphDelta = { id: 'd1', adds: [{ subject: 's', predicate: 'test-predicate', object: 'o' }], deletes: [] };
    
    line.manufacture(delta);
    
    const snapshot = line.getGembaSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].hookId).toBe('test-hook');
    expect(snapshot[0].executionCount).toBe(1);
  });
});
