/**
 * @module skills/hash/proofs
 * @description
 * Gall Classification: S(-1) Hash Primitives (Proof Layer)
 * Purpose: Proves deterministic hashing invariants: same input yields same hash,
 * stable ordering, and tamper resistance.
 */

import { hash } from "./mutations.js";

/**
 * Report structure for Hash proofs.
 */
export type HashProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove the correctness and determinism of hash primitives.
 * @returns {HashProofReport} The outcome of the proof execution.
 */
export function proveHash(): HashProofReport {
  const failures: string[] = [];
  const invariants = [
    "same input = same hash",
    "different input = different hash",
    "stable ordering (JSON keys sorted)",
    "tamper changes hash"
  ];

  try {
    const obj1 = { statement: "Transfer", amount: 100 };
    const obj2 = { statement: "Transfer", amount: 100 };
    const obj3 = { amount: 100, statement: "Transfer" };
    const obj4 = { statement: "Transfer", amount: 101 };

    const h1 = hash(obj1);
    const h2 = hash(obj2);
    const h3 = hash(obj3);
    const h4 = hash(obj4);

    if (h1 !== h2) failures.push("same input = same hash failed");
    if (h1 === h4) failures.push("different input = different hash failed");
    if (h1 !== h3) failures.push("stable ordering failed");
    if (h1 === h4 || h1.length !== 64) failures.push("tamper changes hash failed");

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
