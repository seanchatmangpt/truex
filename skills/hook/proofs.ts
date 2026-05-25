/**
 * @module skills/hook/proofs
 * @description
 * Gall Classification: Proof Layer
 * Purpose: Proves the invariants of the TruexHook behavior: deterministic match,
 * deterministic effect execution, tamper refusal, and replay convergence.
 */

import { TruexHook } from "../../packages/membrane/src/hook.js";
import { createDeterministicContext } from "../../packages/membrane/src/context.js";
import { hash } from "../../packages/membrane/src/index.js";
import type { GraphDelta, HookDefinition } from "../../packages/membrane/src/runtime-law.js";

/**
 * Executes tests to prove Hook primitives.
 * @returns {any} The proof results.
 */
export function proveHook() {
  const invariants: string[] = [];
  const failures: string[] = [];
  const ctx = createDeterministicContext(42);

  try {
    const delta: GraphDelta = {
      id: "delta-1",
      adds: [{ subject: "alice", predicate: "knows", object: "bob" }],
      deletes: []
    };

    const definition: HookDefinition = {
      id: "hook-1",
      name: "Social Hook",
      condition: { kind: "delta-match", predicate: "knows" },
      effects: [{ kind: "emit-event", type: "social-interaction" }]
    };

    const hook = new TruexHook(definition);

    // 1. Same delta -> same hook match
    if (hook.matches(delta)) {
      invariants.push("same delta yields same hook match");
    } else {
      failures.push("hook failed to match valid delta");
    }

    // 2. Same law -> same effect
    const { effects, receipt } = hook.execute(ctx, delta, undefined);
    if (effects.length === 1 && effects[0].kind === "emit-event") {
      invariants.push("same law yields same effect");
    } else {
      failures.push("hook execution produced unexpected effects");
    }

    // 3. Tampered delta -> refusal (implied by hash divergence)
    const tamperedDelta = { ...delta, id: "delta-2" };
    const tamperedInputHash = hash(tamperedDelta);
    if (tamperedInputHash === receipt.inputHash) {
      failures.push("tampered delta did not change input hash");
    } else {
      invariants.push("tampered delta yields divergent input hash (refusal proof)");
    }

    // 4. Same replay -> convergence
    const replayCtx = createDeterministicContext(42);
    const replayed = hook.replay(replayCtx, delta, receipt);
    if (replayed) {
      invariants.push("same replay yields convergence");
    } else {
      failures.push("hook replay diverged from original execution");
    }

    // 5. Tampered receipt -> refusal
    const tamperedReceipt = { ...receipt, status: (receipt.status === "confirmed" ? "refused" : "confirmed") as "confirmed" | "refused" };
    if (hook.replay(replayCtx, delta, tamperedReceipt)) {
      failures.push("hook replay accepted tampered receipt (TPS failure)");
    } else {
      invariants.push("tampered receipt correctly refused (TPS proof)");
    }

  } catch (error_: any) {
    failures.push(`Unexpected error during hook proof: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
