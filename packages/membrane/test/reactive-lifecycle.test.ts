import { describe, it, expect } from "vitest";
import { DoctorAgent } from "../../../agents/doctor/agent.js";

describe("Doctor Agent prove('reactive-lifecycle')", () => {
  it("should prove all 34 reactive patterns and generate reports successfully", async () => {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("reactive-lifecycle");

    expect(report.passed).toBe(true);
    expect(report.failures).toHaveLength(0);
    expect(report.invariants.length).toBeGreaterThan(0);
  });
});
