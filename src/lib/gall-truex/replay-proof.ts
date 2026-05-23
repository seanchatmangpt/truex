import { hash } from "./hash-proof.js";

// Replay is fundamentally a functional convergence check.
// Given a pure transformation function (μ), an input (O), and an expected output hash,
// does the transformation of the input match the expectation?

export function verifyConvergence<TInput, TOutput>(
  computeFn: (input: TInput) => TOutput,
  input: TInput,
  expectedInputHash: string,
  expectedOutputHash: string
): boolean {
  const actualInputHash = hash(input);
  if (actualInputHash !== expectedInputHash) {
    return false; // The input itself diverged
  }

  const actualOutput = computeFn(input);
  const actualOutputHash = hash(actualOutput);

  return actualOutputHash === expectedOutputHash;
}
