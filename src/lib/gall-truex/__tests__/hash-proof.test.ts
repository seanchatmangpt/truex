import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { hash, stableJson } from '../hash-proof.js';

describe('Hash Primitive (BLAKE3)', () => {
  it('Determinism: same input = same hash', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (val) => {
        expect(hash(val)).toBe(hash(val));
      })
    );
  });

  it('Collision Resistance: different input = different hash', () => {
    fc.assert(
      fc.property(fc.jsonValue(), fc.jsonValue(), (val1, val2) => {
        fc.pre(stableJson(val1) !== stableJson(val2));
        expect(hash(val1)).not.toBe(hash(val2));
      })
    );
  });

  it('Stable Ordering: object key order does not affect hash', () => {
    fc.assert(
      fc.property(fc.dictionary(fc.string(), fc.string()), (dict) => {
        const keys = Object.keys(dict);
        if (keys.length < 2) return;
        
        const obj1 = { ...dict };
        const reversedKeys = [...keys].reverse();
        const obj2: Record<string, unknown> = {};
        for (const k of reversedKeys) {
          Object.defineProperty(obj2, k, {
            value: dict[k],
            enumerable: true,
            configurable: true,
            writable: true
          });
        }

        expect(hash(obj1)).toBe(hash(obj2));
      })
    );
  });
});
