 
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  rewriteMutation,
  injectReceiptIntoOutput,
  generateContextInjections,
  isConformingItem
} from "../../src/integration/consequence-actuator.js";
import type { Receipt } from "../../src/runtime-law.js";

describe("Consequence Actuator Integration Tests", () => {
  describe("isConformingItem", () => {
    it("should correctly identify conforming items with forbidden nouns", () => {
      const rule = { forbiddenNouns: ["db", "smoke", "edge"] };
      
      expect(isConformingItem("This is a clean line", rule)).toBe(true);
      expect(isConformingItem("This line refers to db", rule)).toBe(false);
      expect(isConformingItem("This line refers to DB", rule)).toBe(false);
      expect(isConformingItem("This line refers to smokeless", rule)).toBe(false); // substring check
      expect(isConformingItem("This line refers to edge", rule)).toBe(false);
    });

    it("should correctly identify conforming items with allowed nouns", () => {
      const rule = { allowedNouns: ["doctor", "wizard", "telco"] };

      expect(isConformingItem("This line has doctor inside", rule)).toBe(true);
      expect(isConformingItem("This line has wizard inside", rule)).toBe(true);
      expect(isConformingItem("This line has telco inside", rule)).toBe(true);
      expect(isConformingItem("This line has none of the allowed nouns", rule)).toBe(false);
    });

    it("should check forbidden prefixes", () => {
      const rule = { forbiddenPrefixes: ["sudo", "rm"] };

      expect(isConformingItem("sudo apt install", rule)).toBe(false);
      expect(isConformingItem("rm -rf /", rule)).toBe(false);
      expect(isConformingItem("echo sudo", rule)).toBe(true);
    });

    it("should check allowed prefixes", () => {
      const rule = { allowedPrefixes: ["truex", "npm"] };

      expect(isConformingItem("truex doctor prove", rule)).toBe(true);
      expect(isConformingItem("npm run test", rule)).toBe(true);
      expect(isConformingItem("yarn run test", rule)).toBe(false);
    });

    it("should check forbidden patterns", () => {
      const rule = { forbiddenPatterns: ["secret_key", /token_[0-9a-f]{4}/] };

      expect(isConformingItem("use secret_key here", rule)).toBe(false);
      expect(isConformingItem("use token_1a2b here", rule)).toBe(false);
      expect(isConformingItem("use token_xyz here", rule)).toBe(true);
    });
  });

  describe("rewriteMutation", () => {
    it("should strip non-conforming plain text lines", () => {
      const content = [
        "line 1: doctor check",
        "line 2: db setup",
        "line 3: wizard magic",
        "line 4: smoke test",
      ].join("\n");

      const rule = { forbiddenNouns: ["db", "smoke"] };
      const rewritten = rewriteMutation(content, rule);

      expect(rewritten).toBe("line 1: doctor check\nline 3: wizard magic");
    });

    it("should strip non-conforming items in a GraphDelta JSON", () => {
      const delta = {
        id: "delta-1",
        adds: [
          { subject: "urn:agy:task:doctor_check", predicate: "prov:hasStatus", object: "confirmed" },
          { subject: "urn:agy:task:db_setup", predicate: "prov:hasStatus", object: "confirmed" },
        ],
        deletes: [
          { subject: "urn:agy:task:smoke_test", predicate: "prov:hasStatus", object: "confirmed" },
          { subject: "urn:agy:task:wizard_magic", predicate: "prov:hasStatus", object: "confirmed" },
        ]
      };

      const rule = { forbiddenNouns: ["db", "smoke"] };
      const rewritten = rewriteMutation(JSON.stringify(delta), rule);
      const parsed = JSON.parse(rewritten);

      expect(parsed.adds).toHaveLength(1);
      expect(parsed.adds[0].subject).toBe("urn:agy:task:doctor_check");
      expect(parsed.deletes).toHaveLength(1);
      expect(parsed.deletes[0].subject).toBe("urn:agy:task:wizard_magic");
    });

    it("should strip non-conforming items in a JSON Array", () => {
      const items = ["doctor check", "db setup", "wizard magic"];
      const rule = { forbiddenNouns: ["db"] };
      const rewritten = rewriteMutation(JSON.stringify(items), rule);
      const parsed = JSON.parse(rewritten);

      expect(parsed).toEqual(["doctor check", "wizard magic"]);
    });

    it("should strip non-conforming key-value pairs in a JSON Object", () => {
      const obj = {
        "doctor_key": "valid value",
        "db_key": "invalid value",
        "valid_key": "contains db reference",
      };
      const rule = { forbiddenNouns: ["db"] };
      const rewritten = rewriteMutation(JSON.stringify(obj), rule);
      const parsed = JSON.parse(rewritten);

      expect(parsed).toEqual({
        "doctor_key": "valid value"
      });
    });

    it("should fall back to plain text if invalid JSON is passed", () => {
      const content = "invalid { json with db noun";
      const rule = { forbiddenNouns: ["db"] };
      const rewritten = rewriteMutation(content, rule);
      expect(rewritten).toBe("");
    });
  });

  describe("injectReceiptIntoOutput", () => {
    const mockReceipt: Receipt = {
      id: "rcpt-1",
      eventId: "evt-1",
      deltaId: "delta-1",
      inputHash: "input-hash-val",
      outputHash: "output-hash-val",
      previousReceiptHash: "prev-hash-val",
      status: "confirmed",
      receiptHash: "receipt-hash-val",
    };

    it("should append a signature block to plain text outputs", () => {
      const stdout = "Execution successful.";
      const injected = injectReceiptIntoOutput(stdout, mockReceipt);

      expect(injected).toContain("Execution successful.");
      expect(injected).toContain("[TRUEX-RECEIPT]");
      expect(injected).toContain("id: rcpt-1");
      expect(injected).toContain("signature: output-hash-val");
      expect(injected).toContain("[END-TRUEX-RECEIPT]");
    });

    it("should securely embed the receipt inside a JSON Object output", () => {
      const stdoutObj = { status: "success", count: 42 };
      const injected = injectReceiptIntoOutput(JSON.stringify(stdoutObj), mockReceipt);
      const parsed = JSON.parse(injected);

      expect(parsed.status).toBe("success");
      expect(parsed.count).toBe(42);
      expect(parsed._truex_receipt).toBeDefined();
      expect(parsed._truex_receipt.id).toBe("rcpt-1");
      expect(parsed._truex_receipt.signature).toBe("output-hash-val");
    });

    it("should securely envelope a JSON Array output", () => {
      const stdoutArr = ["result1", "result2"];
      const injected = injectReceiptIntoOutput(JSON.stringify(stdoutArr), mockReceipt);
      const parsed = JSON.parse(injected);

      expect(parsed.data).toEqual(["result1", "result2"]);
      expect(parsed._truex_receipt).toBeDefined();
      expect(parsed._truex_receipt.id).toBe("rcpt-1");
      expect(parsed._truex_receipt.signature).toBe("output-hash-val");
    });

    it("should fallback to plain text block if JSON is malformed", () => {
      const stdout = "{ malformed json }";
      const injected = injectReceiptIntoOutput(stdout, mockReceipt);

      expect(injected).toContain("{ malformed json }");
      expect(injected).toContain("[TRUEX-RECEIPT]");
    });
  });

  describe("generateContextInjections", () => {
    const mockTopology = {
      nodes: [
        { id: "nodeA", type: "doctor", queueDepth: 1, status: "healthy" },
        { id: "nodeB", type: "wizard", queueDepth: 2, status: "healthy" },
      ],
      edges: [
        { from: "nodeA", to: "nodeB" }
      ]
    };

    it("generates converged warnings when drift is not detected", () => {
      const driftMetrics = {
        driftDetected: false,
        driftScore: 0,
      };

      const md = generateContextInjections(driftMetrics, mockTopology);
      expect(md).toContain("> [!NOTE]");
      expect(md).toContain("System Converged.");
      expect(md).toContain("Drift Score**: 0.00");
    });

    it("generates warning block when drift is detected", () => {
      const driftMetrics = {
        driftDetected: true,
        driftScore: 85.5,
        outOfSyncPrimitives: ["hash", "receipt"],
        details: "Divergence found in S0 state comparison"
      };

      const md = generateContextInjections(driftMetrics, mockTopology);
      expect(md).toContain("> [!WARNING]");
      expect(md).toContain("System Drift Detected!");
      expect(md).toContain("Drift Score**: 85.50");
      expect(md).toContain("`hash`");
      expect(md).toContain("`receipt`");
      expect(md).toContain("Divergence found in S0 state comparison");
    });

    it("generates markdown table and Mermaid diagram for topology", () => {
      const driftMetrics = { driftDetected: false, driftScore: 0 };
      const md = generateContextInjections(driftMetrics, mockTopology);

      expect(md).toContain("| Node ID | Type | Queue Depth | Status |");
      expect(md).toContain("| `nodeA` | doctor | 1 | healthy |");
      expect(md).toContain("```mermaid");
      expect(md).toContain("graph TD");
      expect(md).toContain('nodeA["nodeA [doctor]"]');
      expect(md).toContain("nodeA --> nodeB");
    });

    it("calculates decomposition pressure properly (Low)", () => {
      const driftMetrics = { driftDetected: false, driftScore: 0 };
      const lowPressureTopology = {
        nodes: [{ id: "n1", queueDepth: 1 }],
        edges: []
      };

      const md = generateContextInjections(driftMetrics, lowPressureTopology);
      expect(md).toContain("> [!NOTE]");
      expect(md).toContain("Decomposition Pressure: Low");
    });

    it("calculates decomposition pressure properly (Moderate)", () => {
      const driftMetrics = { driftDetected: false, driftScore: 0 };
      const moderatePressureTopology = {
        nodes: [{ id: "n1", queueDepth: 5 }],
        edges: []
      };

      const md = generateContextInjections(driftMetrics, moderatePressureTopology);
      expect(md).toContain("> [!IMPORTANT]");
      expect(md).toContain("Decomposition Pressure: Moderate");
    });

    it("calculates decomposition pressure properly (Critical)", () => {
      const driftMetrics = { driftDetected: false, driftScore: 0 };
      const criticalPressureTopology = {
        nodes: [],
        edges: [],
        taskQueue: {
          depth: 10,
          tasks: [
            { id: "task1", type: "doctor" },
            { id: "task2", type: "wizard" }
          ]
        }
      };

      const md = generateContextInjections(driftMetrics, criticalPressureTopology);
      expect(md).toContain("> [!CAUTION]");
      expect(md).toContain("Decomposition Pressure: Critical");
      expect(md).toContain("Decomposition Law");
      expect(md).toContain("- `task1` (doctor)");
    });
  });

  describe("Property-based testing for rewriteMutation", () => {
    it("should satisfy the invariant that a rewritten string never contains a forbidden noun", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 })),
          (words) => {
            const forbiddenNoun = "forbiddennoun";
            const rule = { forbiddenNouns: [forbiddenNoun] };
            
            // Construct input: some random lines, some may have the forbidden noun
            const lines = words.map((w) => w.includes(forbiddenNoun) ? w : `${w} ${forbiddenNoun} ${w}`);
            const content = lines.join("\n");
            
            const rewritten = rewriteMutation(content, rule);
            
            // Check that the forbidden word never appears in the output lines
            const outputLines = rewritten.split("\n");
            for (const line of outputLines) {
              if (line.trim()) {
                expect(line.toLowerCase().includes(forbiddenNoun)).toBe(false);
              }
            }
          }
        )
      );
    });
  });
});
