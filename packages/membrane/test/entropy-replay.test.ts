import { describe, it, expect } from 'vitest';
import { createDeterministicContext } from '../src/context.js';
import { TruexEntropy } from '../src/lib/entropy.js';
import { hash } from '../src/hash.js';

describe('Deterministic Entropy Replay', () => {
  it('should generate identical sequences when using the same context seed', () => {
    const seed = 12345;
    const context1 = createDeterministicContext(seed);
    const context2 = createDeterministicContext(seed);

    const entropy1 = new TruexEntropy(context1);
    const entropy2 = new TruexEntropy(context2);

    // Sequence of operations
    const runSequence = (entropy: TruexEntropy) => {
      return {
        uuid1: entropy.uuid(),
        uuid2: entropy.uuid(),
        name: entropy.faker.person.fullName(),
        email: entropy.faker.internet.email(),
        now1: entropy.now(),
        now2: entropy.now(),
        randInt: entropy.faker.number.int(),
      };
    };

    const result1 = runSequence(entropy1);
    const result2 = runSequence(entropy2);

    expect(result1).toEqual(result2);
    expect(hash(result1)).toBe(hash(result2));
  });

  it('should achieve 100% hash parity in a "randomly generated" operation sequence', () => {
    const seed = 98765;
    const context = createDeterministicContext(seed);
    const entropy = new TruexEntropy(context);

    // Generate a sequence of operations and record their hashes
    const operations = [];
    for (let i = 0; i < 10; i++) {
      const op = {
        type: entropy.faker.helpers.arrayElement(['create', 'update', 'delete']),
        id: entropy.uuid(),
        timestamp: entropy.now(),
        data: entropy.faker.lorem.sentence()
      };
      operations.push(op);
    }

    const originalHash = hash(operations);

    // Replay with a fresh context using the same seed
    const replayContext = createDeterministicContext(seed);
    const replayEntropy = new TruexEntropy(replayContext);

    const replayedOperations = [];
    for (let i = 0; i < 10; i++) {
      const op = {
        type: replayEntropy.faker.helpers.arrayElement(['create', 'update', 'delete']),
        id: replayEntropy.uuid(),
        timestamp: replayEntropy.now(),
        data: replayEntropy.faker.lorem.sentence()
      };
      replayedOperations.push(op);
    }

    const replayHash = hash(replayedOperations);

    expect(replayedOperations).toEqual(operations);
    expect(replayHash).toBe(originalHash);
  });

  it('should support deterministic fast-check properties', () => {
    const seed = 42;
    const context = createDeterministicContext(seed);
    const entropy = new TruexEntropy(context);

    let runs1: any[] = [];
    entropy.assert(entropy.fc.property(entropy.fc.string(), (s) => {
      runs1.push(s);
      return true;
    }), { numRuns: 5 });

    const context2 = createDeterministicContext(seed);
    const entropy2 = new TruexEntropy(context2);
    let runs2: any[] = [];
    entropy2.assert(entropy2.fc.property(entropy2.fc.string(), (s) => {
      runs2.push(s);
      return true;
    }), { numRuns: 5 });

    expect(runs1).toEqual(runs2);
  });
});
