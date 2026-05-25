import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { ProjectCell } from "../../src/index.js";
import { TelcoAgent } from "../../../../agents/telco/agent.js";
import { DoctorAgent } from "../../../../agents/doctor/agent.js";
import { hash } from "../../src/hash.js";
import type { TelcoReceipt, TelcoPacket } from "../../src/telco.gall.js";

describe("Doctor-Wizard-Telco-Telemetry Integration", () => {
  // Helper to map Wizard artifacts to Telco canonical packets
  function mapToTelcoPacket(sourceId: string, payload: any, sessionId: string): TelcoPacket {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const canonicalHash = hash(encodedPayload);
    return {
      id: `packet_${sourceId}`,
      sessionId,
      canonicalHash,
      encodedPayload
    };
  }

  it("should coordinate project manufacturing (Wizard), packet transmission (Telco), and trace lineage validation (Doctor)", async () => {
    // --- 1. SETUP WIZARD PROJECT CELL ---
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "truex-telemetry-integration-"));
    const cell = new ProjectCell(tempDir);

    // Initialize Project cell to generate start configuration and genesis command receipt
    const initReceipt = cell.init({
      path: tempDir,
      mission: "Telemetry Integration Verification",
      durationHours: 12,
      agents: 5,
      status: "initialized"
    });

    expect(initReceipt.status).toBe("succeeded");
    expect(initReceipt.receiptHash).toBeDefined();

    // Get Accounting stats
    const accPath = path.join(tempDir, ".truex", "reports", "accounting.json");
    const accountingData = JSON.parse(fs.readFileSync(accPath, "utf8"));

    // --- 2. MAP TELEMETRY TO TELCO CANONICAL PACKETS ---
    const sessionId = "session_telemetry_555";
    const packet1 = mapToTelcoPacket("init_receipt", initReceipt, sessionId);
    const packet2 = mapToTelcoPacket("accounting_stats", accountingData, sessionId);

    expect(packet1.id).toBe("packet_init_receipt");
    expect(packet1.canonicalHash).toBe(hash(packet1.encodedPayload));
    expect(packet2.id).toBe("packet_accounting_stats");
    expect(packet2.canonicalHash).toBe(hash(packet2.encodedPayload));

    // --- 3. TRANSMIT PACKETS AND BUILD TELCO RECEIPT CHAIN ---
    // TelcoReceipt 1: Links init packet transmission directly to Wizard parent receipt
    const telcoReceipt1: TelcoReceipt = {
      receiptId: "", // computed below
      verb: "transmit",
      sessionId,
      channelId: "channel_outbound_telemetry",
      packetHash: packet1.canonicalHash,
      parentReceiptHash: initReceipt.receiptHash, // unbroken lineage link
      decision: "admitted",
      createdAt: new Date().toISOString()
    };
    
    // Compute receiptId using truex hash primitive
    const { receiptId: _r1, ...r1Payload } = telcoReceipt1;
    telcoReceipt1.receiptId = hash(r1Payload);

    // TelcoReceipt 2: Links stats packet transmission to previous TelcoReceipt
    const telcoReceipt2: TelcoReceipt = {
      receiptId: "", // computed below
      verb: "transmit",
      sessionId,
      channelId: "channel_outbound_telemetry",
      packetHash: packet2.canonicalHash,
      parentReceiptHash: telcoReceipt1.receiptId, // chain linking
      decision: "admitted",
      createdAt: new Date().toISOString()
    };

    const { receiptId: _r2, ...r2Payload } = telcoReceipt2;
    telcoReceipt2.receiptId = hash(r2Payload);

    // Verify TelcoAgent validation logic
    const telcoAgent = new TelcoAgent();
    // Validate packet 1 contents can be parsed and verified
    const decodedPayload1 = Buffer.from(packet1.encodedPayload, "base64").toString("utf8");
    const parsedReceipt1 = JSON.parse(decodedPayload1);
    expect(parsedReceipt1.receiptHash).toBe(initReceipt.receiptHash);

    // --- 4. RUN DOCTOR AGENT LINEAGE VALIDATION ---
    const doctorAgent = new DoctorAgent();
    const operations = [
      { id: "init_receipt", type: "init", payloadHash: packet1.canonicalHash },
      { id: "accounting_stats", type: "stats", payloadHash: packet2.canonicalHash }
    ];
    const receipts = [
      initReceipt,
      telcoReceipt1,
      telcoReceipt2
    ];

    // Method A: Direct function call
    const verifyResult = doctorAgent.verifyTelemetryLineage(operations, receipts);
    expect(verifyResult.passed).toBe(true);
    expect(verifyResult.failures).toHaveLength(0);
    expect(verifyResult.invariants.length).toBeGreaterThan(0);

    // Check key invariants returned by Doctor
    const hasValidOcel = verifyResult.invariants.some(inv => inv.includes("valid self-integrity"));
    expect(hasValidOcel).toBe(true);

    const hasLinks = verifyResult.invariants.some(inv => inv.includes("Receipt link verified"));
    expect(hasLinks).toBe(true);

    // Method B: Through Doctor prove API
    const report = await doctorAgent.prove("telemetry-integration", { operations, receipts });
    expect(report.passed).toBe(true);
    expect(report.failures).toHaveLength(0);
    expect(report.invariants).toEqual(verifyResult.invariants);

    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should fail validation if telemetry lineage is tampered or incomplete (Adversarial Testing)", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "truex-telemetry-adversarial-"));
    const cell = new ProjectCell(tempDir);

    const initReceipt = cell.init({
      path: tempDir,
      mission: "Telemetry Integration Adversarial Verification",
      durationHours: 12,
      agents: 5,
      status: "initialized"
    });

    const sessionId = "session_telemetry_adversarial";
    const packet1 = mapToTelcoPacket("init_receipt", initReceipt, sessionId);

    const telcoReceipt1: TelcoReceipt = {
      receiptId: "",
      verb: "transmit",
      sessionId,
      channelId: "channel_outbound_telemetry",
      packetHash: packet1.canonicalHash,
      parentReceiptHash: initReceipt.receiptHash,
      decision: "admitted",
      createdAt: new Date().toISOString()
    };
    const { receiptId: _r1, ...r1Payload } = telcoReceipt1;
    telcoReceipt1.receiptId = hash(r1Payload);

    const doctorAgent = new DoctorAgent();
    const operations = [
      { id: "init_receipt", type: "init", payloadHash: packet1.canonicalHash }
    ];

    // Scenario 1: Healthy path passes
    const healthyCheck = doctorAgent.verifyTelemetryLineage(operations, [initReceipt, telcoReceipt1]);
    expect(healthyCheck.passed).toBe(true);

    // Scenario 2: Tampered receipt self-integrity hash fails
    const tamperedReceipt = { ...initReceipt, receiptHash: "0000000000000000000000000000000000000000000000000000000000000000" };
    const tamperedCheck = doctorAgent.verifyTelemetryLineage(operations, [tamperedReceipt, telcoReceipt1]);
    expect(tamperedCheck.passed).toBe(false);
    expect(tamperedCheck.failures.some(f => f.includes("hash mismatch"))).toBe(true);

    // Scenario 3: Broken parent receipt linkage fails
    const brokenLinkReceipt = { ...telcoReceipt1, parentReceiptHash: "non_existent_parent_hash" };
    const { receiptId: _br, ...brPayload } = brokenLinkReceipt;
    brokenLinkReceipt.receiptId = hash(brPayload);
    
    const linkCheck = doctorAgent.verifyTelemetryLineage(operations, [initReceipt, brokenLinkReceipt]);
    expect(linkCheck.passed).toBe(false);
    expect(linkCheck.failures.some(f => f.includes("Broken lineage link"))).toBe(true);

    // Scenario 4: Unreceipted operation fails
    const missingReceiptCheck = doctorAgent.verifyTelemetryLineage(
      [...operations, { id: "unreceipted_op", type: "delete", payloadHash: "some_unreceipted_hash" }],
      [initReceipt, telcoReceipt1]
    );
    expect(missingReceiptCheck.passed).toBe(false);
    expect(missingReceiptCheck.failures.some(f => f.includes("Unreceipted operation detected"))).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
