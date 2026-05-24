/**
 * @module skills/membrane/proofs
 * @description
 * Gall Classification: Proof Layer
 * Purpose: Proves membrane invariants including read/write boundaries, prototype lockdown,
 * transaction rollbacks, deep proxy propagation, and descriptor bypassing refusal.
 */

import {
  createProxy,
  createTransactionContext,
  registerTransactionInterceptors,
} from "./mutations.js";
import {
  createCapabilityContext,
  registerCapabilityInterceptors,
  createSandboxContext,
  registerSandboxInterceptors,
} from "./invariant.js";

/**
 * Report structure for Membrane proofs.
 */
export type MembraneProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove the Membrane boundaries.
 * @returns {MembraneProofReport} The proof results.
 */
export function proveMembrane(): MembraneProofReport {
  const failures: string[] = [];
  const invariants = [
    "object mutation allowed",
    "prototype mutation refused",
    "readonly boundary enforced",
    "transaction rollback succeeded",
    "descriptor access checked",
    "defineProperty trapped",
    "deep proxy wrapping captured"
  ];

  try {
    // 1. Mutation
    const target = { balance: 100 };
    const proxyInterface = createProxy(target);
    const capCtx = createCapabilityContext(target, {
      canRead: new Set(["balance"]),
      canWrite: new Set(["balance"]),
    });
    registerCapabilityInterceptors(proxyInterface, capCtx);
    capCtx.call(() => {
      proxyInterface.proxy.balance = 200;
      if (proxyInterface.proxy.balance !== 200) failures.push("object mutation failed");
    });

    // 2. Proto Refusal
    try {
      Object.setPrototypeOf(proxyInterface.proxy, { hacked: true });
      failures.push("prototype mutation succeeded unexpectedly");
    } catch (error_: any) {
      if (!error_.message.includes("Prototype mutation refused on Truex Membrane")) {
        failures.push(`unexpected prototype mutation error: ${error_.message}`);
      }
    }

    // 3. Readonly Boundary
    const readonlyCtx = createCapabilityContext(target, {
      canRead: new Set(["balance"]),
      canWrite: new Set(),
    });
    const proxyInterface2 = createProxy(target);
    registerCapabilityInterceptors(proxyInterface2, readonlyCtx);
    readonlyCtx.call(() => {
      let writeFailed = false;
      try {
        proxyInterface2.proxy.balance = 300;
      } catch {
        writeFailed = true;
      }
      if (!writeFailed && proxyInterface2.proxy.balance === 300) {
        failures.push("readonly boundary allowed mutation");
      }
    });

    // 4. Transaction Rollback
    const targetRollback = { score: 10 };
    const proxyInterface3 = createProxy(targetRollback);
    const txCtx = createTransactionContext(targetRollback);
    registerTransactionInterceptors(proxyInterface3, txCtx);

    txCtx.call(() => {
      proxyInterface3.proxy.score = 50;
    });
    txCtx.rollback();

    if (targetRollback.score !== 10) failures.push("transaction rollback failed to restore state");

    // 5. Descriptor ACL Bypass Check (Remediation)
    const bypassCtx = createCapabilityContext(target, {
      canRead: new Set(), // Cannot read balance
      canWrite: new Set(),
    });
    const proxyInterfaceBypass = createProxy(target);
    registerCapabilityInterceptors(proxyInterfaceBypass, bypassCtx);
    bypassCtx.call(() => {
      let descriptorBypassCaught = false;
      try {
        Object.getOwnPropertyDescriptor(proxyInterfaceBypass.proxy, 'balance');
      } catch (error_: any) {
        if (error_.message.includes("Access denied")) {
          descriptorBypassCaught = true;
        }
      }
      if (!descriptorBypassCaught) {
        failures.push("getOwnPropertyDescriptor bypassed read ACL checks");
      }
    });

    // 6. defineProperty Trap check (Remediation)
    const defineCtx = createCapabilityContext(target, {
      canRead: new Set(["balance"]),
      canWrite: new Set(), // Cannot write
    });
    const proxyInterfaceDefine = createProxy(target);
    registerCapabilityInterceptors(proxyInterfaceDefine, defineCtx);
    defineCtx.call(() => {
      let definePropertyTrapped = false;
      try {
        Object.defineProperty(proxyInterfaceDefine.proxy, 'balance', { value: 999 });
      } catch {
        definePropertyTrapped = true;
      }
      if (!definePropertyTrapped && target.balance === 999) {
        failures.push("Object.defineProperty bypassed write ACL checks");
      }
    });

    // 7. Deep Proxy Wrapping Check (Remediation)
    const deepTarget = { info: { name: "Alice" } };
    const deepProxyInterface = createProxy(deepTarget);
    const deepTxCtx = createTransactionContext(deepTarget);
    registerTransactionInterceptors(deepProxyInterface, deepTxCtx);

    deepTxCtx.call(() => {
      deepProxyInterface.proxy.info.name = "Bob"; // Deep property set
    });
    deepTxCtx.rollback();

    if (deepTarget.info.name !== "Alice") {
      failures.push("Deep proxy mutation rollback failed (deep property changes not captured)");
    }

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
