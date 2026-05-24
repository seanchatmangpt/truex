import { describe, it, expect, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { createProxy } from "../../src/proxy/create-proxy.js";
import {
  createInvariantContext,
  registerInvariantInterceptors,
} from "../../src/invariants/invariant-context.js";
import {
  createVirtualContext,
  registerVirtualInterceptors,
} from "../../src/virtualization/virtual-context.js";
import {
  createContractContext,
  createContractApplyInterceptor,
  registerContractInterceptors,
} from "../../src/contracts/contract-context.js";
import {
  createTransactionContext,
  createTransactionSetInterceptor,
  createTransactionDeletePropertyInterceptor,
  registerTransactionInterceptors,
} from "../../src/transactions/transaction-context.js";
import {
  createSimulationContext,
  registerSimulationInterceptors,
} from "../../src/simulation/simulation-context.js";

// Telemetry tracker to collect metrics for the benchmark reports
const telemetry: {
  circularInvariants: {
    rawLoopDurationMs: number;
    customGuardDurationMs: number;
    rawLoopMaxDepth: number;
  };
  virtualComputations: Array<{
    depth: number;
    memoized: boolean;
    durationMs: number;
    value: number;
  }>;
  contractIsolation: {
    transactionRollbackPassed: boolean;
    simulationAbortPassed: boolean;
    purityViolationPassed: boolean;
  };
} = {
  circularInvariants: {
    rawLoopDurationMs: 0,
    customGuardDurationMs: 0,
    rawLoopMaxDepth: 0,
  },
  virtualComputations: [],
  contractIsolation: {
    transactionRollbackPassed: false,
    simulationAbortPassed: false,
    purityViolationPassed: false,
  },
};

describe("Invariant, Contract & Virtual Value Stress Tests", () => {
  // ==========================================================================
  // SECTION 1: CIRCULAR INVARIANTS
  // ==========================================================================
  describe("Circular Invariants", () => {
    it("proves raw circular invariants terminate safely via V8 stack exhaustion (RangeError wrapped in Jidoka Error)", () => {
      const target = { age: 10, balance: 100 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      let callDepth = 0;

      // Define two invariants that trigger mutations on each other's target property
      const invCtx = createInvariantContext(target, {
        ageInvariant: (t: any, op: any) => {
          if (op.trap === "set" && op.property === "age") {
            callDepth++;
            // Circular trigger: modifying balance when age is modified
            proxy.balance = op.value * 10;
          }
          return true;
        },
        balanceInvariant: (t: any, op: any) => {
          if (op.trap === "set" && op.property === "balance") {
            callDepth++;
            // Circular trigger: modifying age when balance is modified
            proxy.age = op.value / 10;
          }
          return true;
        },
      });

      registerInvariantInterceptors(proxyInterface, invCtx);

      const start = Date.now();
      let thrownError: any = null;

      try {
        invCtx.call(() => {
          proxy.age = 20;
        });
      } catch (err) {
        thrownError = err;
      }

      const duration = Date.now() - start;
      telemetry.circularInvariants.rawLoopDurationMs = duration;
      telemetry.circularInvariants.rawLoopMaxDepth = callDepth;

      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError.message).toContain("Maximum call stack size exceeded");
      expect(duration).toBeLessThan(200); // Verify it terminates quickly without freezing
    });

    it("proves circular invariants can be programmatically detected and halted using a loop-breaker", () => {
      const target = { age: 10, balance: 100 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      // Context-level recursion guard
      const activeProperties = new Set<string>();

      const invCtx = createInvariantContext(target, {
        ageInvariant: (t: any, op: any) => {
          if (op.trap === "set" && op.property === "age") {
            if (activeProperties.has("age")) {
              throw new Error("Circular invariant loop detected on 'age'");
            }
            activeProperties.add("age");
            try {
              proxy.balance = op.value * 10;
            } finally {
              activeProperties.delete("age");
            }
          }
          return true;
        },
        balanceInvariant: (t: any, op: any) => {
          if (op.trap === "set" && op.property === "balance") {
            if (activeProperties.has("balance")) {
              throw new Error("Circular invariant loop detected on 'balance'");
            }
            activeProperties.add("balance");
            try {
              proxy.age = op.value / 10;
            } finally {
              activeProperties.delete("balance");
            }
          }
          return true;
        },
      });

      registerInvariantInterceptors(proxyInterface, invCtx);

      const start = Date.now();
      let thrownError: any = null;

      try {
        invCtx.call(() => {
          proxy.age = 20;
        });
      } catch (err) {
        thrownError = err;
      }

      const duration = Date.now() - start;
      telemetry.circularInvariants.customGuardDurationMs = duration;

      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError.message).toContain("Circular invariant loop detected");
      expect(duration).toBeLessThan(50); // Custom guard should fail even faster than RangeError
    });
  });

  // ==========================================================================
  // SECTION 2: DEEP VIRTUAL COMPUTATIONS
  // ==========================================================================
  describe("Deep Virtual Computations", () => {
    const runDeepVirtualChain = (
      depth: number,
      memoize: boolean
    ): { durationMs: number; value: number } => {
      const target = { baseValue: 10 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      const virtualFields: any = {};

      // v0 returns base value
      virtualFields["v0"] = {
        compute: (t: any) => t.baseValue,
        memoize,
      };

      // v_i computes based on proxy.v_{i-1} + 1
      for (let i = 1; i <= depth; i++) {
        const prevField = `v${i - 1}`;
        virtualFields[`v${i}`] = {
          compute: (t: any) => proxy[prevField] + 1,
          memoize,
        };
      }

      const virtualCtx = createVirtualContext(target, { virtualFields });
      registerVirtualInterceptors(proxyInterface, virtualCtx);

      let finalVal = 0;
      const start = Date.now();

      virtualCtx.call(() => {
        // Trigger calculation (which cascades down)
        finalVal = proxy[`v${depth}`];

        // If memoized, access again to verify caching performance
        if (memoize) {
          finalVal = proxy[`v${depth}`];
        }
      });

      const durationMs = Date.now() - start;
      return { durationMs, value: finalVal };
    };

    it("evaluates shallow virtual computation chains (depth 10)", () => {
      const memoizedResult = runDeepVirtualChain(10, true);
      const rawResult = runDeepVirtualChain(10, false);

      expect(memoizedResult.value).toBe(20);
      expect(rawResult.value).toBe(20);

      telemetry.virtualComputations.push({
        depth: 10,
        memoized: true,
        durationMs: memoizedResult.durationMs,
        value: memoizedResult.value,
      });
      telemetry.virtualComputations.push({
        depth: 10,
        memoized: false,
        durationMs: rawResult.durationMs,
        value: rawResult.value,
      });
    });

    it("evaluates moderate virtual computation chains (depth 100)", () => {
      const memoizedResult = runDeepVirtualChain(100, true);
      const rawResult = runDeepVirtualChain(100, false);

      expect(memoizedResult.value).toBe(110);
      expect(rawResult.value).toBe(110);

      telemetry.virtualComputations.push({
        depth: 100,
        memoized: true,
        durationMs: memoizedResult.durationMs,
        value: memoizedResult.value,
      });
      telemetry.virtualComputations.push({
        depth: 100,
        memoized: false,
        durationMs: rawResult.durationMs,
        value: rawResult.value,
      });
    });

    it("evaluates deep virtual computation chains (depth 500) successfully", () => {
      const memoizedResult = runDeepVirtualChain(500, true);
      const rawResult = runDeepVirtualChain(500, false);

      expect(memoizedResult.value).toBe(510);
      expect(rawResult.value).toBe(510);

      telemetry.virtualComputations.push({
        depth: 500,
        memoized: true,
        durationMs: memoizedResult.durationMs,
        value: memoizedResult.value,
      });
      telemetry.virtualComputations.push({
        depth: 500,
        memoized: false,
        durationMs: rawResult.durationMs,
        value: rawResult.value,
      });
    });

    it("evaluates extremely deep virtual computation chains (depth 1000) successfully", () => {
      const memoizedResult = runDeepVirtualChain(1000, true);
      const rawResult = runDeepVirtualChain(1000, false);

      expect(memoizedResult.value).toBe(1010);
      expect(rawResult.value).toBe(1010);

      telemetry.virtualComputations.push({
        depth: 1000,
        memoized: true,
        durationMs: memoizedResult.durationMs,
        value: memoizedResult.value,
      });
      telemetry.virtualComputations.push({
        depth: 1000,
        memoized: false,
        durationMs: rawResult.durationMs,
        value: rawResult.value,
      });
    });

    it("terminates safely when encountering circular virtual fields (vA -> vB -> vA)", () => {
      const target = { baseValue: 42 };
      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      const virtualCtx = createVirtualContext(target, {
        virtualFields: {
          vA: {
            compute: (t: any) => proxy.vB + 1,
            memoize: true,
          },
          vB: {
            compute: (t: any) => proxy.vA + 1,
            memoize: true,
          },
        },
      });

      registerVirtualInterceptors(proxyInterface, virtualCtx);

      let thrownError: any = null;
      try {
        virtualCtx.call(() => {
          const val = proxy.vA;
        });
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).toBeInstanceOf(RangeError);
      expect(thrownError.message).toContain("Maximum call stack size exceeded");
    });
  });

  // ==========================================================================
  // SECTION 3: CONTRACT ISOLATION & ROLLBACK CORRECTNESS
  // ==========================================================================
  describe("Contract Isolation", () => {
    it("ensures that mutations are rolled back when a post-condition (return type verification) fails", () => {
      const target = {
        value: 10,
        updateValue(val: number) {
          this.value = val;
          return val;
        },
      };

      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      const txCtx = createTransactionContext(target);
      const contractCtx = createContractContext(target, {
        updateValue: {
          returnType: "string", // Forced type mismatch contract
        },
      });

      // Custom get interceptor registered FIRST to wrap updateValue in a contract-apply proxy
      proxyInterface.defineGetInterceptor((t: any, prop: any, receiver: any) => {
        if (prop === "updateValue") {
          const rawMethod = t[prop];
          const methodProxyInterface = createProxy(rawMethod);
          methodProxyInterface.defineApplyInterceptor(createContractApplyInterceptor(contractCtx));
          return methodProxyInterface.proxy.bind(receiver);
        }
        return undefined;
      });

      // Register transaction set/delete traps on the main object proxy
      proxyInterface.defineSetInterceptor(createTransactionSetInterceptor(txCtx));
      proxyInterface.defineDeletePropertyInterceptor(createTransactionDeletePropertyInterceptor(txCtx));

      let contractErrorThrown = false;

      // Run combined Transaction & Contract isolation check
      txCtx.call(() => {
        contractCtx.call(() => {
          try {
            console.log("DEBUG: BEFORE CALLING updateValue");
            const res = proxy.updateValue(50);
            console.log("DEBUG: AFTER CALLING updateValue, RESULT:", res);
          } catch (err: any) {
            console.log("DEBUG: ERROR THROWN:", err);
            if (err.message.includes("Contract violation: updateValue must return string")) {
              contractErrorThrown = true;
            }
            txCtx.rollback(); // Rollback transaction on contract violation
          }
        });
      });

      expect(contractErrorThrown).toBe(true);
      expect(target.value).toBe(10); // Target state must be restored, no permanent bleed
      telemetry.contractIsolation.transactionRollbackPassed = true;
    });

    it("ensures that active side-effects in preconditions do not bleed permanently when isolated by a simulation", () => {
      const target = {
        value: 10,
        updateValue(val: number) {
          this.value = val;
          return val;
        },
      };

      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      const simCtx = createSimulationContext(target);

      // Define a contract with a validation function that makes a side-effect mutation, then fails
      const contractCtx = createContractContext(target, {
        updateValue: {
          validate: (args: any[]) => {
            // Write validation-level side effect on proxy
            proxy.value = 999;
            return "Arguments validation failed on purpose";
          },
        },
      });

      // Custom get interceptor registered FIRST to wrap updateValue in a contract-apply proxy
      proxyInterface.defineGetInterceptor((t: any, prop: any, receiver: any) => {
        if (prop === "updateValue") {
          const rawMethod = t[prop];
          const methodProxyInterface = createProxy(rawMethod);
          methodProxyInterface.defineApplyInterceptor(createContractApplyInterceptor(contractCtx));
          return methodProxyInterface.proxy.bind(receiver);
        }
        return undefined;
      });

      // Register simulation interceptors on the main object proxy
      registerSimulationInterceptors(proxyInterface, simCtx);

      let contractErrorThrown = false;

      simCtx.speculate(() => {
        contractCtx.call(() => {
          try {
            proxy.updateValue(50);
          } catch (err: any) {
            if (err.message.includes("Arguments validation failed on purpose")) {
              contractErrorThrown = true;
            }
            simCtx.abort(); // Abort simulation, dropping speculative state changes
          }
        });
      });

      expect(contractErrorThrown).toBe(true);
      expect(target.value).toBe(10); // Real target must remain 10, validation mutation was isolated
      telemetry.contractIsolation.simulationAbortPassed = true;
    });

    it("ensures that purity violations throw contract violations and revert mutations via transactions", () => {
      const target = {
        value: 100,
        mutateInternal(val: number) {
          this.value = val;
          return val;
        },
      };

      const proxyInterface = createProxy(target);
      const proxy = proxyInterface.proxy;

      const txCtx = createTransactionContext(target);
      const contractCtx = createContractContext(target, {
        mutateInternal: {
          pure: true, // Marked as pure, but mutates target inside
        },
      });

      // Custom get interceptor registered FIRST to wrap mutateInternal in a contract-apply proxy
      proxyInterface.defineGetInterceptor((t: any, prop: any, receiver: any) => {
        if (prop === "mutateInternal") {
          const rawMethod = t[prop];
          const methodProxyInterface = createProxy(rawMethod);
          methodProxyInterface.defineApplyInterceptor(createContractApplyInterceptor(contractCtx));
          return methodProxyInterface.proxy.bind(receiver);
        }
        return undefined;
      });

      // Register transaction set/delete traps on the main object proxy
      proxyInterface.defineSetInterceptor(createTransactionSetInterceptor(txCtx));
      proxyInterface.defineDeletePropertyInterceptor(createTransactionDeletePropertyInterceptor(txCtx));

      let purityViolationThrown = false;

      txCtx.call(() => {
        contractCtx.call(() => {
          try {
            proxy.mutateInternal(500);
          } catch (err: any) {
            if (err.message.includes("is marked as pure but caused side effects")) {
              purityViolationThrown = true;
            }
            txCtx.rollback(); // Rollback mutation
          }
        });
      });

      expect(purityViolationThrown).toBe(true);
      expect(target.value).toBe(100); // Verify no permanent side effect remained
      telemetry.contractIsolation.purityViolationPassed = true;
    });
  });

  // ==========================================================================
  // SECTION 4: TELEMETRY AND REPORT WRITER
  // ==========================================================================
  describe("Telemetry Export", () => {
    it("saves the benchmark reports to docs/", () => {
      const reportJsonPath = path.resolve(
        process.cwd(),
        "docs/benchmarks/cap-inv-contract-virtual-breakpoint.report.json"
      );
      const reportMdPath = path.resolve(
        process.cwd(),
        "docs/benchmarks/cap-inv-contract-virtual-breakpoint.report.md"
      );

      // Construct JSON Report
      const jsonReport = {
        timestamp: new Date().toISOString(),
        circularInvariants: telemetry.circularInvariants,
        virtualComputations: telemetry.virtualComputations,
        contractIsolation: telemetry.contractIsolation,
      };

      // Construct Markdown Report
      const mdReport = `# Invariant, Contract & Virtual Value Stress Test Report

## Metadata
- **Timestamp:** ${jsonReport.timestamp}
- **Target OS:** mac
- **Test Runner:** Vitest

## 1. Circular Invariants
- **Raw Loop Duration:** ${telemetry.circularInvariants.rawLoopDurationMs}ms
- **V8 Stack Overflow Call Depth:** ${telemetry.circularInvariants.rawLoopMaxDepth} frames
- **Custom Guard Duration:** ${telemetry.circularInvariants.customGuardDurationMs}ms
- **Status:** ✅ Successfully resolved without thread freezing. V8 cleanly terminated with RangeError (wrapped in Jidoka Error), and programmatic guard terminated with custom loop-breaker Error.

## 2. Deep Virtual Computations (Depth & Memoization Benchmark)
| Depth | Memoized | Duration (ms) | Result Value | Caching Efficiency |
|-------|----------|---------------|--------------|-------------------|
${telemetry.virtualComputations
  .map((v) => {
    const matchingMemoized = telemetry.virtualComputations.find(
      (other) => other.depth === v.depth && other.memoized
    );
    const matchingNonMemoized = telemetry.virtualComputations.find(
      (other) => other.depth === v.depth && !other.memoized
    );
    const speedup =
      matchingMemoized && matchingNonMemoized && matchingMemoized.durationMs > 0
        ? (matchingNonMemoized.durationMs / matchingMemoized.durationMs).toFixed(2) + "x"
        : "N/A";
    return `| ${v.depth} | ${v.memoized ? "Yes 🚀" : "No 🐢"} | ${v.durationMs}ms | ${v.value} | Speedup: ${speedup} |`;
  })
  .join("\n")}

- **Circular Virtual Fields (vA -> vB -> vA):** ✅ Safely terminated via V8 RangeError (Maximum call stack size exceeded).

## 3. Contract Isolation
- **Transaction Rollback check:** ${telemetry.contractIsolation.transactionRollbackPassed ? "Passed (Target state fully recovered)" : "Failed"}
- **Simulation Abort check:** ${telemetry.contractIsolation.simulationAbortPassed ? "Passed (Speculative state successfully discarded)" : "Failed"}
- **Purity Violation check:** ${telemetry.contractIsolation.purityViolationPassed ? "Passed (Reverted target mutations on purity breach)" : "Failed"}

---
*Report auto-generated by Vitest run.*`;

      // Write files
      fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
      fs.writeFileSync(reportJsonPath, JSON.stringify(jsonReport, null, 2), "utf8");
      fs.writeFileSync(reportMdPath, mdReport, "utf8");

      expect(fs.existsSync(reportJsonPath)).toBe(true);
      expect(fs.existsSync(reportMdPath)).toBe(true);
    });
  });
});
