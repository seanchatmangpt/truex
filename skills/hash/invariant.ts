/**
 * @module skills/hash/invariant
 * @description
 * Gall Classification: S(-1) Hash Primitives
 * Purpose: Provides invariant validation for hashing inputs and outputs to ensure
 * deterministic consequence. Rejects unserializable types and malformed hashes.
 */

/**
 * Asserts that the input is a valid serializable type for hashing.
 * @param {unknown} value - The input to validate.
 * @throws {TypeError} If the value is a function or symbol.
 */
export function assertValidHashInput(value: unknown): void {
  if (typeof value === "function" || typeof value === "symbol") {
    throw new TypeError("Cannot hash non-serializable types (functions, symbols)");
  }
}

/**
 * Asserts that the provided hash is a valid 64-character BLAKE3 hex string.
 * @param {string} hashHex - The hash string to validate.
 * @throws {TypeError|Error} If the format is invalid.
 */
export function assertValidHashOutput(hashHex: string): void {
  if (typeof hashHex !== "string") {
    throw new TypeError("Hash output must be a string");
  }
  if (!/^[0-9a-f]{64}$/i.test(hashHex)) {
    throw new Error(`Invalid BLAKE3 hash output: "${hashHex}" (must be 64 character hex string)`);
  }
}
