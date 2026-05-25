import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { hash } from "../src/hash.js";
import { verifyConvergence } from "../src/replay.js";

describe("Replay Convergence Properties", () => {
  it("∀ function computeFn, input, and expected hashes: verifyConvergence proves convergence, and input/engine mutation causes divergence", () => {
    fc.assert(
      fc.property(
        fc.integer().filter((x) => x !== 0),
        fc.constantFrom(2, 3, 5), // multiplier for law
        (input, multiplier) => {
          const computeFn = (n: number) => n * multiplier;

          const expectedInputHash = hash(input);
          const expectedOutput = computeFn(input);
          const expectedOutputHash = hash(expectedOutput);

          // Property 1: Perfect convergence on identical input and law
          const converged = verifyConvergence(computeFn, input, expectedInputHash, expectedOutputHash);
          expect(converged).toBe(true);

          // Property 2: Input mutation leads to divergence
          const mutatedInput = input + 1;
          const inputDiverged = verifyConvergence(computeFn, mutatedInput, expectedInputHash, expectedOutputHash);
          expect(inputDiverged).toBe(false);

          // Property 3: Law/Engine mutation leads to divergence
          const mutatedComputeFn = (n: number) => n * (multiplier + 1);
          const lawDiverged = verifyConvergence(mutatedComputeFn, input, expectedInputHash, expectedOutputHash);
          expect(lawDiverged).toBe(false);
        }
      )
    );
  });
});
