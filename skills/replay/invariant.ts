/**
 * @module skills/replay/invariant
 * @description
 * Gall Classification: S1 Replay Primitives
 * Purpose: Enforces output hash convergence invariants for replay operations.
 */

import { hash } from "../hash/mutations.js";

/**
 * Asserts that the computed output hash matches the expected hash.
 * @param {unknown} actualOutput - The actual output.
 * @param {string} expectedOutputHash - The expected output hash.
 * @throws {Error} If divergence is detected.
 */
export function assertOutputConvergence(actualOutput: unknown, expectedOutputHash: string): void {
  const actualHash = hash(actualOutput);
  if (actualHash !== expectedOutputHash) {
    throw new Error(`Replay divergence detected: actual hash "${actualHash}" does not match expected "${expectedOutputHash}"`);
  }
}
