import { describe, it, expect } from 'vitest';
import {
  replayTrajectory,
  useTrajectoryContext,
  tryUseTrajectoryContext
} from '../../src/integration/trajectory-replay.js';

describe('trajectory-replay', () => {
  it('should replay flat property set and deleteProperty traps', () => {
    const initialState = {
      name: 'Agent Smith',
      role: 'Sentinel',
      version: 1
    };

    const journal = [
      { trap: 'set' as const, property: 'role', value: 'Rogue' },
      { trap: 'set' as const, property: 'version', value: 2 },
      { trap: 'deleteProperty' as const, property: 'name' },
      { trap: 'set' as const, property: 'status', value: 'active' }
    ];

    const finalState = replayTrajectory(initialState, journal);

    expect(finalState).toEqual({
      role: 'Rogue',
      version: 2,
      status: 'active'
    });

    // Verify structuredClone (initialState remains unchanged)
    expect(initialState).toEqual({
      name: 'Agent Smith',
      role: 'Sentinel',
      version: 1
    });
  });

  it('should replay nested property set and deleteProperty traps', () => {
    const initialState = {
      profile: {
        details: {
          age: 30,
          location: 'Zion'
        }
      },
      tags: ['matrix']
    };

    const journal = [
      { trap: 'set' as const, property: 'profile.details.age', value: 31 },
      { trap: 'set' as const, property: 'profile.details.status', value: 'unplugged' },
      { trap: 'deleteProperty' as const, property: 'profile.details.location' },
      // setting a new nested structure path
      { trap: 'set' as const, property: 'meta.info.created', value: true }
    ];

    const finalState = replayTrajectory(initialState, journal);

    expect(finalState).toEqual({
      profile: {
        details: {
          age: 31,
          status: 'unplugged'
        }
      },
      tags: ['matrix'],
      meta: {
        info: {
          created: true
        }
      }
    });

    // Verify structuredClone (initialState remains unchanged)
    expect(initialState.profile.details.age).toBe(30);
    expect(initialState.profile.details.location).toBe('Zion');
    expect((initialState as any).meta).toBeUndefined();
  });

  it('should respect exact keys containing dots when they exist directly', () => {
    const initialState = {
      'nested.key': 'old-value',
      other: {
        key: 'val'
      }
    };

    const journal = [
      { trap: 'set' as const, property: 'nested.key', value: 'new-value' },
      { trap: 'deleteProperty' as const, property: 'nested.key' }
    ];

    const finalState = replayTrajectory(initialState, journal);
    expect(finalState).toEqual({
      other: {
        key: 'val'
      }
    });
  });

  it('should run in a clean context boundary using unctx', () => {
    const initialState = { a: 1 };

    // Outside context checks
    expect(tryUseTrajectoryContext()).toBeUndefined();
    expect(() => useTrajectoryContext()).toThrow();

    // Verify context is accessible during replay if checked inside a custom hook or getter
    // (mocking this behavior via checking the context boundary inside the execution)
    let contextValueDuringReplay: any;
    
    // We can intercept the set or mock the operation to inspect the context
    const customJournal = [
      {
        trap: 'set' as const,
        property: 'a',
        get value() {
          contextValueDuringReplay = tryUseTrajectoryContext();
          return 3;
        }
      }
    ];

    const finalState = replayTrajectory(initialState, customJournal);
    expect(finalState.a).toBe(3);
    expect(contextValueDuringReplay).toBeDefined();
    expect(contextValueDuringReplay.a).toBe(3); // cloned state

    // Outside context checks again
    expect(tryUseTrajectoryContext()).toBeUndefined();
    expect(() => useTrajectoryContext()).toThrow();
  });
});
