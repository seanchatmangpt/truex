/**
 * @module consequence-actuator
 * @description Evaluates system topologies, drift metrics, and rule conformance.
 * Gall Classification: S2 (engine primitives).
 */
/* eslint-disable unicorn/no-null */
import type { Receipt } from "../runtime-law.js";

/**
 * Rules for stripping non-conforming items during mutation rewriting.
 */
export interface MutationRule {
  forbiddenNouns?: string[];
  allowedNouns?: string[];
  forbiddenPatterns?: (string | RegExp)[];
  forbiddenPrefixes?: string[];
  allowedPrefixes?: string[];
}

/**
 * Metrics representing the drift state of the system.
 */
export interface DriftMetrics {
  driftDetected: boolean;
  driftScore: number;
  outOfSyncPrimitives?: string[];
  lastCheckedTimestamp?: number;
  details?: Record<string, unknown> | string;
}

/**
 * A single node within the system topology.
 */
export interface TopologyNode {
  id: string;
  type?: string;
  queueDepth?: number;
  status?: string;
}

/**
 * A directed edge within the system topology showing component interactions.
 */
export interface TopologyEdge {
  from: string;
  to: string;
  type?: string;
}

/**
 * Representation of the complete system topology, including components, connections, and task queue.
 */
export interface SystemTopology {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  taskQueue?: {
    depth: number;
    tasks: Array<{ id: string; type: string }>;
  };
}

/**
 * Checks if a single item conforms to the specified mutation rule.
 */
export function isConformingItem(item: string, rule: MutationRule): boolean {
  const itemTrimmed = item.trim();

  // Check forbidden prefixes
  if (rule.forbiddenPrefixes) {
    for (const prefix of rule.forbiddenPrefixes) {
      if (itemTrimmed.startsWith(prefix)) {
        return false;
      }
    }
  }

  // Check allowed prefixes
  if (rule.allowedPrefixes && rule.allowedPrefixes.length > 0) {
    let hasAllowedPrefix = false;
    for (const prefix of rule.allowedPrefixes) {
      if (itemTrimmed.startsWith(prefix)) {
        hasAllowedPrefix = true;
        break;
      }
    }
    if (!hasAllowedPrefix) {
      return false;
    }
  }

  // Check forbidden nouns (case-insensitive substring and boundary check)
  if (rule.forbiddenNouns) {
    const itemLower = itemTrimmed.toLowerCase();
    for (const noun of rule.forbiddenNouns) {
      const nounLower = noun.toLowerCase();
      const wordRegex = new RegExp(`\\b${nounLower}\\b`, "i");
      if (wordRegex.test(itemLower) || itemLower.includes(nounLower)) {
        return false;
      }
    }
  }

  // Check allowed nouns (case-insensitive boundary check)
  if (rule.allowedNouns && rule.allowedNouns.length > 0) {
    const itemLower = itemTrimmed.toLowerCase();
    let hasAllowedNoun = false;
    for (const noun of rule.allowedNouns) {
      const nounLower = noun.toLowerCase();
      const wordRegex = new RegExp(`\\b${nounLower}\\b`, "i");
      if (wordRegex.test(itemLower) || itemLower.includes(nounLower)) {
        hasAllowedNoun = true;
        break;
      }
    }
    if (!hasAllowedNoun) {
      return false;
    }
  }

  // Check forbidden patterns (string or RegExp)
  if (rule.forbiddenPatterns) {
    for (const pattern of rule.forbiddenPatterns) {
      if (typeof pattern === "string") {
        if (itemTrimmed.includes(pattern)) {
          return false;
        }
      } else if (pattern instanceof RegExp && pattern.test(itemTrimmed)) {
          return false;
        }
    }
  }

  return true;
}

/**
 * Rewrites a mutation content string by stripping any items/lines that do not conform to the rules.
 * Handles both plain text multi-line inputs and JSON structured contents (GraphDeltas, arrays, objects).
 */
export function rewriteMutation(content: string, rule: MutationRule): string {
  if (!content) {
    return "";
  }

  // Attempt to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") {
      // Case 1: GraphDelta structure
      if (Array.isArray(parsed.adds) && Array.isArray(parsed.deletes)) {
        const filterQuad = (quad: any) => {
          const quadStr = `${quad.subject || ""} ${quad.predicate || ""} ${quad.object || ""} ${quad.graph || ""}`;
          return isConformingItem(quadStr, rule);
        };
        return JSON.stringify({
          ...parsed,
          adds: parsed.adds.filter(filterQuad),
          deletes: parsed.deletes.filter(filterQuad),
        });
      }

      // Case 2: JSON Array
      if (Array.isArray(parsed)) {
        const filteredArray = parsed.filter((item) => {
          if (typeof item === "string") {
            return isConformingItem(item, rule);
          }
          return isConformingItem(JSON.stringify(item), rule);
        });
        return JSON.stringify(filteredArray);
      }

      // Case 3: Arbitrary JSON Object
      const filteredObj: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(parsed)) {
        const valStr = typeof val === "string" ? val : JSON.stringify(val);
        if (isConformingItem(key, rule) && isConformingItem(valStr, rule)) {
          filteredObj[key] = val;
        }
      }
      return JSON.stringify(filteredObj);
    }
  } catch {
    // Non-JSON content falls through to plain text parsing
  }

  // Case 4: Plain Text line-by-line parsing
  const lines = content.split(/\r?\n/);
  const filteredLines = lines.filter((line) => isConformingItem(line, rule));
  return filteredLines.join("\n");
}

/**
 * Appends signed signatures to outputs. If output is valid JSON, it securely embeds the
 * receipt under the `_truex_receipt` field. If output is plain text, it appends the signature
 * in a clear-text receipt block.
 */
export function injectReceiptIntoOutput(stdout: string, receipt: Receipt & { signature?: string }): string {
  const trimmed = stdout.trim();
  const signature = receipt.signature || receipt.outputHash;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const receiptData = {
        id: receipt.id,
        eventId: receipt.eventId,
        deltaId: receipt.deltaId,
        inputHash: receipt.inputHash,
        outputHash: receipt.outputHash,
        previousReceiptHash: receipt.previousReceiptHash,
        status: receipt.status,
        receiptHash: receipt.receiptHash,
        signature,
      };

      return Array.isArray(parsed) ? JSON.stringify({
          data: parsed,
          _truex_receipt: receiptData,
        }, null, 2) : JSON.stringify({
          ...parsed,
          _truex_receipt: receiptData,
        }, null, 2);
    }
  } catch {
    // Falls back to appending signature block to plain text
  }

  const block = [
    "",
    "---",
    `[TRUEX-RECEIPT]`,
    `id: ${receipt.id}`,
    `eventId: ${receipt.eventId}`,
    `deltaId: ${receipt.deltaId}`,
    `inputHash: ${receipt.inputHash}`,
    `outputHash: ${receipt.outputHash}`,
    `previousReceiptHash: ${receipt.previousReceiptHash || "null"}`,
    `status: ${receipt.status}`,
    `receiptHash: ${receipt.receiptHash}`,
    `signature: ${signature}`,
    `[END-TRUEX-RECEIPT]`,
  ].join("\n");

  return trimmed ? `${trimmed}\n${block}` : block;
}

/**
 * Generates markdown content injections containing system drift warnings, system topology summaries
 * (including a visual Mermaid diagram and node status table), and decomposition pressure details.
 */
export function generateContextInjections(
  driftMetrics: DriftMetrics,
  topology: SystemTopology
): string {
  let markdown = "";

  // 1. Drift Warnings
  markdown += `### 🔄 Drift Metrics & Verification\n\n`;
  if (driftMetrics.driftDetected) {
    markdown += `> [!WARNING]\n`;
    markdown += `> **System Drift Detected!** The system has diverged from its lawful closure.\n`;
    markdown += `> - **Drift Score**: ${driftMetrics.driftScore.toFixed(2)}\n`;
    if (driftMetrics.outOfSyncPrimitives && driftMetrics.outOfSyncPrimitives.length > 0) {
      markdown += `> - **Out-of-Sync Primitives**: ${driftMetrics.outOfSyncPrimitives.map((p) => `\`${p}\``).join(", ")}\n`;
    }
    if (driftMetrics.details) {
      const detailsStr = typeof driftMetrics.details === "string"
        ? driftMetrics.details
        : JSON.stringify(driftMetrics.details);
      markdown += `> - **Details**: ${detailsStr}\n`;
    }
  } else {
    markdown += `> [!NOTE]\n`;
    markdown += `> **System Converged.** All operational states match the proven invariants.\n`;
    markdown += `> - **Drift Score**: ${driftMetrics.driftScore.toFixed(2)}\n`;
  }
  markdown += `\n`;

  // 2. Topology Summary
  markdown += `### 🗺️ System Topology Summary\n\n`;
  markdown += `The current operational closure consists of the following nodes and edges:\n\n`;

  // Table of nodes
  markdown += `| Node ID | Type | Queue Depth | Status |\n`;
  markdown += `| :--- | :--- | :--- | :--- |\n`;
  for (const node of topology.nodes) {
    const queueDepth = node.queueDepth === undefined ? 0 : node.queueDepth;
    const status = node.status || "active";
    markdown += `| \`${node.id}\` | ${node.type || "unknown"} | ${queueDepth} | ${status} |\n`;
  }
  markdown += `\n`;

  // Mermaid diagram
  if (topology.nodes.length > 0) {
    markdown += `\`\`\`mermaid\ngraph TD\n`;
    for (const node of topology.nodes) {
      const label = node.type ? `${node.id} [${node.type}]` : node.id;
      markdown += `  ${node.id}["${label}"]\n`;
    }
    for (const edge of topology.edges) {
      markdown += `  ${edge.from} --> ${edge.to}\n`;
    }
    markdown += `\`\`\`\n\n`;
  }

  // 3. Decomposition Pressure (Queue depth evaluation)
  const queueDepth = topology.taskQueue?.depth === undefined
    ? topology.nodes.reduce((sum, n) => sum + (n.queueDepth || 0), 0)
    : topology.taskQueue.depth;

  let pressureLevel = "Low";
  let pressureAlert = "NOTE";
  let pressureDescription = "The task queue is within stable bounds. No premature decomposition required.";

  if (queueDepth > 7) {
    pressureLevel = "Critical";
    pressureAlert = "CAUTION";
    pressureDescription = "High queue depth indicates substantial decomposition pressure. In accordance with the Decomposition Law, consider decomposing complex modules or task definitions into simpler, working primitives (S₀ → S₁).";
  } else if (queueDepth > 3) {
    pressureLevel = "Moderate";
    pressureAlert = "IMPORTANT";
    pressureDescription = "The task queue is growing. Monitor invariants and stabilize working primitives before introducing further complexity.";
  }

  markdown += `### ⏳ Decomposition Pressure Analysis\n\n`;
  markdown += `> [!${pressureAlert}]\n`;
  markdown += `> **Decomposition Pressure: ${pressureLevel}**\n`;
  markdown += `> - **Active Task Queue Depth**: ${queueDepth} tasks\n`;
  markdown += `> - **Status**: ${pressureDescription}\n`;

  if (topology.taskQueue?.tasks && topology.taskQueue.tasks.length > 0) {
    markdown += `\n**Pending Queue Tasks:**\n`;
    for (const task of topology.taskQueue.tasks) {
      markdown += `- \`${task.id}\` (${task.type})\n`;
    }
  }

  markdown += `\n`;

  return markdown;
}
