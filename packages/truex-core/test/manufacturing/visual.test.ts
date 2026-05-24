import { describe, it, expect, vi } from "vitest";
import { ManufacturingDashboard } from "../../src/manufacturing/visual.js";
import type { Receipt } from "../../src/runtime-law.js";

describe("ManufacturingDashboard", () => {
  it("should record operations and calculate throughput", () => {
    vi.useFakeTimers();
    const dashboard = new ManufacturingDashboard();
    dashboard.recordOperation();
    dashboard.recordOperation();
    
    vi.advanceTimersByTime(1000);
    
    const metrics = dashboard.getMetrics();
    expect(metrics.totalOps).toBe(2);
    expect(metrics.throughput).toBe(2);
    vi.useRealTimers();
  });

  it("should track line stops (Andon)", () => {
    const dashboard = new ManufacturingDashboard();
    dashboard.recordLineStop();
    
    const metrics = dashboard.getMetrics();
    expect(metrics.lineStops).toBe(1);
    
    const render = dashboard.render();
    expect(render).toContain("[STOPPED]");
    expect(render).toContain("JIDOKA INTERVENTION REQUIRED");
  });

  it("should calculate quality metrics from receipts", () => {
    const dashboard = new ManufacturingDashboard();
    
    const mockReceipt = (status: 'confirmed' | 'refused'): Receipt => ({
      id: "r1",
      eventId: "e1",
      deltaId: "d1",
      inputHash: "in",
      outputHash: "out",
      previousReceiptHash: null,
      status,
      receiptHash: "h"
    });

    dashboard.recordReceipt(mockReceipt('confirmed'));
    dashboard.recordReceipt(mockReceipt('refused'));
    
    const metrics = dashboard.getMetrics();
    expect(metrics.convergenceRate).toBe(0.5);
    
    const render = dashboard.render();
    expect(render).toContain("Rate:    50.0%");
  });

  it("should display the dashboard to stdout", () => {
    const dashboard = new ManufacturingDashboard();
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    dashboard.display();
    
    expect(writeSpy).toHaveBeenCalled();
    expect(writeSpy.mock.calls[0][0]).toContain("TRUEX MANUFACTURING DASHBOARD");
    
    writeSpy.mockRestore();
  });
});
