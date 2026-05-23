/**
 * Invariant enforcement for deterministic hashing.
 */

export function assertValidHashInput(value: unknown): void {
  if (typeof value === "function" || typeof value === "symbol") {
    throw new TypeError("Cannot hash non-serializable types (functions, symbols)");
  }
}

export function assertValidHashOutput(hashHex: string): void {
  if (typeof hashHex !== "string") {
    throw new TypeError("Hash output must be a string");
  }
  if (!/^[0-9a-f]{64}$/i.test(hashHex)) {
    throw new Error(`Invalid BLAKE3 hash output: "${hashHex}" (must be 64 character hex string)`);
  }
}
