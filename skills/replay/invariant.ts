import { hash } from "../hash/mutations.js";

/**
 * Asserts that the computed output hash matches the expected hash.
 */
export function assertOutputConvergence(actualOutput: unknown, expectedOutputHash: string): void {
  const actualHash = hash(actualOutput);
  if (actualHash !== expectedOutputHash) {
    throw new Error(`Replay divergence detected: actual hash "${actualHash}" does not match expected "${expectedOutputHash}"`);
  }
}
