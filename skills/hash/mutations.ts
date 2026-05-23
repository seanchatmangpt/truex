import { blake3 } from "@noble/hashes/blake3.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { assertValidHashInput, assertValidHashOutput } from "./invariant.js";

/**
 * stableJson provides a deterministic string representation of objects.
 * Arrays maintain their order.
 * Objects have their keys sorted alphabetically.
 */
export function stableJson(value: unknown): string {
  assertValidHashInput(value);
  
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }
  
  return JSON.stringify(value);
}

/**
 * Hash Primitive
 * Implements BLAKE3 over the deterministic JSON representation.
 */
export function hash(value: unknown): string {
  const jsonString = stableJson(value);
  const bytes = utf8ToBytes(jsonString);
  const hashBytes = blake3(bytes);
  const result = bytesToHex(hashBytes);
  assertValidHashOutput(result);
  return result;
}
