import { blake3 } from "@noble/hashes/blake3.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

/**
 * stableJson provides a deterministic string representation of objects.
 * Arrays maintain their order.
 * Objects have their keys sorted alphabetically.
 */
export function stableJson(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  
  const type = typeof value;
  
  if (type === "boolean" || type === "number" || type === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (type === "object") {
    const object = value as Record<string, unknown>;
    const sortedKeys = Object.keys(object).sort();
    return `{${sortedKeys
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }
  
  return String(value);
}

/**
 * S₋₁ Hash Primitive
 * Implements BLAKE3 over the deterministic JSON representation.
 */
export function hash(value: unknown): string {
  const jsonString = stableJson(value);
  const bytes = utf8ToBytes(jsonString);
  const hashBytes = blake3(bytes);
  return bytesToHex(hashBytes);
}
