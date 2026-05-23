import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { verifyConvergence } from '../replay-proof.js';
import { hash } from '../hash-proof.js';

describe('Replay Primitive', () => {
  const μ = (input: number) => input * 2;
  const μMutated = (input: number) => input * 3;

  it('Converges under identical input and law', () => {
    fc.assert(
      fc.property(fc.integer(), (input) => {
        const expectedInputHash = hash(input);
        const expectedOutputHash = hash(μ(input));

        expect(verifyConvergence(μ, input, expectedInputHash, expectedOutputHash)).toBe(true);
      })
    );
  });

  it('Diverges under mutated input', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (input, mutatedInput) => {
        fc.pre(input !== mutatedInput);
        const expectedInputHash = hash(input);
        const expectedOutputHash = hash(μ(input));

        expect(verifyConvergence(μ, mutatedInput, expectedInputHash, expectedOutputHash)).toBe(false);
      })
    );
  });

  it('Diverges under mutated operational law', () => {
    fc.assert(
      fc.property(fc.integer(), (input) => {
        fc.pre(input !== 0); // 0 * 2 == 0 * 3
        const expectedInputHash = hash(input);
        const expectedOutputHash = hash(μ(input));

        expect(verifyConvergence(μMutated, input, expectedInputHash, expectedOutputHash)).toBe(false);
      })
    );
  });
});
