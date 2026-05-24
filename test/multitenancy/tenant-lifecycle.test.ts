import { describe, it, expect } from "vitest";
import {
  createTenantContext,
  tenantConfigs,
  finalizedTenants,
} from "../../src/multitenancy/tenant-context.js";

function runGC() {
  if (globalThis.gc) {
    try {
      globalThis.gc();
    } catch {
      // ignore
    }
  }
}

describe("Tenant Lifecycle & GC-safe Configuration Management", () => {
  it("should clear configurations and references on explicit dispose()", () => {
    const target = { base: "value" };
    const tenant = createTenantContext(target, "tenant-lifecycle-test", {
      visibleKeys: new Set(["base"]),
      metadata: { name: "Teardown Lifecycle Test" },
    });

    // Check configuration mapping exists
    expect(tenantConfigs.size).toBe(1);

    // Call dispose
    tenant.dispose();

    // Verify configuration map size returns to zero
    expect(tenantConfigs.size).toBe(0);

    // Verify it throws on subsequent operations
    expect(() => tenant.getTenantId()).toThrow(
      "Tenant context has been disposed",
    );
    expect(() => tenant.proxy.base).toThrow("Tenant context has been disposed");
  });

  it("should trace GC cleanup using FinalizationRegistry", async () => {
    const target = { base: "value" };
    let tenant: any = createTenantContext(target, "tenant-gc-trace", {
      metadata: { note: "GC target" },
    });

    const tenantId = tenant.getTenantId();
    let proxy: any = tenant.proxy;

    // Verify config is stored
    expect(tenantConfigs.size).toBe(1);
    expect(proxy).toBeDefined();

    if (globalThis.gc) {
      // Nullify references to trigger GC
      tenant = undefined;
      proxy = undefined;

      // Run GC multiple times to ensure garbage collector reclaims the references
      for (let i = 0; i < 5; i++) {
        runGC();
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Finalization registry should have captured the GC of the proxy
      expect(finalizedTenants.has(tenantId)).toBe(true);
      expect(tenantConfigs.size).toBe(0);
    } else {
      // If GC is not available, explicitly dispose it to prevent test pollution
      tenant.dispose();
      expect(tenantConfigs.size).toBe(0);
    }
  });

  it("runs a leak stress test instantiating and disposing thousands of tenant contexts", async () => {
    runGC();
    const memBefore = process.memoryUsage().heapUsed;

    const initialSize = tenantConfigs.size;
    const stressCount = 5000;
    const target = { sharedKey: "value" };

    for (let i = 0; i < stressCount; i++) {
      const tenant = createTenantContext(target, `stress-tenant-${i}`, {
        visibleKeys: new Set(["sharedKey"]),
        virtualProperties: { index: i },
        metadata: { index: i },
      });
      // Immediately dispose
      tenant.dispose();
    }

    // Verify map size returns to initial size after all disposals
    expect(tenantConfigs.size).toBe(initialSize);

    // Run GC
    for (let i = 0; i < 5; i++) {
      runGC();
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const memAfter = process.memoryUsage().heapUsed;

    if (globalThis.gc) {
      const leakBytes = memAfter - memBefore;
      // Memory leakage should be negligible (allowing slight overhead from test execution frame, well below 2MB)
      expect(leakBytes).toBeLessThan(1024 * 1024 * 2);
    }
  });
});
