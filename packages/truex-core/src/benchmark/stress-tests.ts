/**
 * @module stress-tests
 * @description Stress tests and failure invariant checks for the Gall system.
 * Gall Classification: S-2 (benchmark primitives).
 */
import { createDeterministicContext } from "../context.js";
import { TruexHook } from "../hook.js";
import { parseGraphDelta, type GraphDelta } from "../runtime-law.js";
import { verifyReceipt } from "../receipt.js";
import { AndonSystem, PokaYoke } from "../manufacturing/jidoka.js";

/**
 * Implementation of Stress/Failure Invariants for the Million Hook Church Case Study.
 */
export function runStressTests() {
  const invariants: string[] = [];
  const failures: string[] = [];
  const ctx = createDeterministicContext(42);

  console.log("🛠️ Running Stress Invariants...");

  try {
    // 1. Malformed delta refusal via parseGraphDelta
    try {
      parseGraphDelta({ id: "bad", adds: "not-an-array" } as any);
      failures.push("malformed delta was admitted by parser");
    } catch (e) {
      invariants.push("malformed delta correctly refused by parser (parseGraphDelta)");
    }

    // Setup standard hook
    const hook = new TruexHook({
      id: "hook-1",
      name: "n",
      condition: { kind: "always" },
      effects: [{ kind: "emit-event", type: "event-type" }]
    });

    const delta: GraphDelta = {
      id: "delta-1",
      adds: [{ subject: "s", predicate: "rdf:type", object: "o", graph: null }],
      deletes: []
    };

    // 2. Receipt tamper detection
    const { receipt } = hook.execute(ctx, delta, null);
    
    const tamperedReceipt = { ...receipt, outputHash: "0".repeat(64) };
    if (!verifyReceipt(tamperedReceipt)) {
      invariants.push("receipt tamper correctly detected");
    } else {
      failures.push("tampered receipt passed verification");
    }

    // 3. Replay divergence (seed mismatch)
    const replayCtx = createDeterministicContext(43); // Different seed
    if (!hook.replay(replayCtx, delta, receipt)) {
      invariants.push("replay divergence correctly detected (seed mismatch)");
    } else {
      failures.push("replay converged despite seed mismatch");
    }

    // 4. Replay divergence (input mutation)
    const mutatedDelta: GraphDelta = {
      ...delta,
      adds: [{ subject: "s", predicate: "rdf:type", object: "mutated-o", graph: null }]
    };
    if (!hook.replay(ctx, mutatedDelta, receipt)) {
      invariants.push("replay divergence correctly detected (input mutation)");
    } else {
      failures.push("replay converged despite input mutation");
    }

    // 5. Capacity breach / Jidoka halt (Muri) through actual PokaYoke precheck
    const andon = new AndonSystem();
    const pokaYoke = new PokaYoke(andon);

    const massiveDelta: GraphDelta = {
      id: "massive",
      adds: Array.from({ length: 101 }, (_, i) => ({
        subject: `s:${i}`,
        predicate: "rdf:type",
        object: "o",
        graph: null
      })),
      deletes: []
    };

    try {
      pokaYoke.guardExecution(hook, ctx, massiveDelta, () => ({ effects: hook.definition.effects, receipt, events: [] }));
      failures.push("capacity breach (Muri) was admitted by PokaYoke");
    } catch (error: any) {
      if (error.message.includes("exceeds processing capacity") || andon.isStopped()) {
        invariants.push("capacity breach (Muri) correctly blocked by Jidoka line stop");
      } else {
        failures.push(`Capacity breach threw incorrect error: ${error.message}`);
      }
    }

    // 6. Non-matching predicate (Muda check)
    const nonMatchingHook = new TruexHook({
      id: "non-matching-hook",
      name: "non-matching",
      condition: { kind: "delta-match", predicate: "schema:assignedTo" } as any,
      effects: [{ kind: "emit-event", type: "event-type" }]
    });

    const nonMatchingDelta: GraphDelta = {
      id: "delta-non-matching",
      adds: [{ subject: "s", predicate: "schema:other", object: "o", graph: null }],
      deletes: []
    };

    const andonMuda = new AndonSystem();
    const pokaYokeMuda = new PokaYoke(andonMuda);

    try {
      pokaYokeMuda.guardExecution(nonMatchingHook, ctx, nonMatchingDelta, () => ({ effects: nonMatchingHook.definition.effects, receipt, events: [] }));
      failures.push("non-matching predicate was admitted by Muda check");
    } catch (error: any) {
      if (error.message.includes("does not match Delta") || andonMuda.isStopped()) {
        invariants.push("non-matching predicate correctly blocked by Muda check");
      } else {
        failures.push(`Muda check threw incorrect error: ${error.message}`);
      }
    }

  } catch (e: any) {
    failures.push(`Unexpected stress test error: ${e.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
