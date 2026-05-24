/* eslint-disable unicorn/no-null, unicorn/prefer-number-properties, unicorn/prefer-string-slice, unicorn/prefer-structured-clone, unicorn/numeric-separators-style, unicorn/prefer-at, unicorn/no-lonely-if, unicorn/no-negated-condition, unicorn/prefer-spread, unicorn/catch-error-name */
import { parseGraphDelta, type HookCondition, type HookEffect, type Receipt, type Quad } from "./runtime-law.js";
import { createDeterministicContext, type TruexContext } from "./context.js";
import { hash, createReceipt, verifyReceipt } from "./index.js";

// ==========================================
// Required Type Definitions
// ==========================================

export interface TopologyNode {
  id: string;
  name: string;
  condition: HookCondition;
  behavior: (state: any, delta: TopologyDelta, ctx: TruexContext) => { nextState: any; effects: HookEffect[] };
  state: any;
  lastReceiptHash: string | null;
}

export interface TopologyEdge {
  sourceId: string;
  targetId: string;
  triggerPredicate?: string;
}

export interface TopologyDelta {
  id: string;
  adds: Quad[];
  deletes: Quad[];
  parentDeltaId?: string | null;
}

export interface TopologyChain {
  id: string;
  rootDelta: TopologyDelta;
  deltas: TopologyDelta[];
}

export interface TopologyReceipt extends Receipt {
  nodeId: string;
  depth: number;
  stateBefore: any;
  stateAfter: any;
}

export interface TopologyRun {
  id: string;
  chainId: string;
  receipts: TopologyReceipt[];
  status: "success" | "failed" | "rollback";
  error?: string;
}

export interface TopologyRollback {
  id: string;
  runId: string;
  failedReceiptId: string;
  rollbackReceipts: TopologyReceipt[];
  originalStateSnapshot: Record<string, any>;
}

export interface TopologyStorm {
  id: string;
  detectedAt: number;
  path: string[];
  rootDeltaId: string;
  reason: string;
}

export interface TopologyReplayReport {
  case: string;
  status: "passed" | "failed";
  runId: string;
  verifiedReceiptCount: number;
  replayConvergenceVerified: boolean;
  accounting: TopologyAccounting;
  reportHash: string;
}

export interface TopologyAccounting {
  attempted: number;
  succeeded: number;
  failed: number;
  refused: number;
  quarantined: number;
  skipped: number;
  successRatePct: number;
  failureRatePct: number;
  refusalRatePct: number;
  quarantineRatePct: number;
  successRatePctString: string;
  failureRatePctString: string;
  refusalRatePctString: string;
  quarantineRatePctString: string;
}

export interface TopologyRuntime {
  nodes: Map<string, TopologyNode>;
  edges: TopologyEdge[];
  parentSeed: number;
  maxDepth: number;
  maxDeltas: number;
  runs: Map<string, TopologyRun>;
  storms: TopologyStorm[];
  quarantine: any[];
  refusedReceipts: Receipt[];
}

// ==========================================
// Internal Helpers
// ==========================================

function matchesCondition(condition: HookCondition, delta: TopologyDelta): boolean {
  if (condition.kind === "always") {
    return true;
  }
  if (condition.kind === "delta-match") {
    const predicate = condition.predicate;
    return (
      delta.adds.some((q) => q.predicate === predicate) ||
      delta.deletes.some((q) => q.predicate === predicate)
    );
  }
  return false;
}

// ==========================================
// Required Core Functions
// ==========================================

export function createTopologyRuntime(parentSeed: number = 1716480000000): TopologyRuntime {
  return {
    nodes: new Map(),
    edges: [],
    parentSeed,
    maxDepth: 20,
    maxDeltas: 100,
    runs: new Map(),
    storms: [],
    quarantine: [],
    refusedReceipts: [],
  };
}

export function registerTopologyHook(
  runtime: TopologyRuntime,
  id: string,
  name: string,
  condition: HookCondition,
  behavior: (state: any, delta: TopologyDelta, ctx: TruexContext) => { nextState: any; effects: HookEffect[] },
  initialState: any = {}
): void {
  const node: TopologyNode = {
    id,
    name,
    condition,
    behavior,
    state: JSON.parse(JSON.stringify(initialState)),
    lastReceiptHash: null,
  };
  runtime.nodes.set(id, node);
}

export function emitTopologyDelta(runtime: TopologyRuntime, delta: TopologyDelta): TopologyChain {
  parseGraphDelta(delta);
  const chainIdHash = hash({ parentSeed: runtime.parentSeed, deltaId: delta.id });
  const chainId = `chain_${chainIdHash.substring(0, 16)}`;

  return {
    id: chainId,
    rootDelta: delta,
    deltas: [delta],
  };
}

export function detectHookStorm(
  runtime: TopologyRuntime,
  nodePath: string[],
  nextNodeId: string
): boolean {
  return nodePath.includes(nextNodeId);
}

export function rollbackTopologyChain(
  runtime: TopologyRuntime,
  runId: string,
  failedReceiptId: string,
  originalStateSnapshot: Record<string, { state: any; lastReceiptHash: string | null }>
): TopologyRollback {
  // Restore all node states and receipt hashes
  for (const [id, snap] of Object.entries(originalStateSnapshot)) {
    const node = runtime.nodes.get(id);
    if (node) {
      node.state = JSON.parse(JSON.stringify(snap.state));
      node.lastReceiptHash = snap.lastReceiptHash;
    }
  }

  const rollbackReceipts: TopologyReceipt[] = [];
  const run = runtime.runs.get(runId);

  if (run) {
    run.status = "rollback";
    const stepCtx = createDeterministicContext(runtime.parentSeed);
    let lastRefusedHash: string | null = null;

    for (let i = run.receipts.length - 1; i >= 0; i--) {
      const rcpt = run.receipts[i];
      const rollbackReceipt = createReceipt(
        stepCtx,
        `evt_rollback_${stepCtx.uuid()}`,
        rcpt.deltaId,
        rcpt.receiptHash,
        hash({ rolledBack: true }),
        lastRefusedHash || rcpt.receiptHash,
        "refused",
        undefined,
        {
          rollbackOf: rcpt.id,
          failedChildId: failedReceiptId,
          reason: "Causal rollback triggered by downstream failure",
        }
      );

      const topoRollbackRcpt: TopologyReceipt = {
        ...rollbackReceipt,
        nodeId: rcpt.nodeId,
        depth: rcpt.depth,
        stateBefore: rcpt.stateAfter,
        stateAfter: rcpt.stateBefore,
      };

      rollbackReceipts.push(topoRollbackRcpt);
      lastRefusedHash = rollbackReceipt.receiptHash;
    }

    run.receipts.push(...rollbackReceipts);
  }

  const originalStatesOnly: Record<string, any> = {};
  for (const [id, snap] of Object.entries(originalStateSnapshot)) {
    originalStatesOnly[id] = snap.state;
  }

  return {
    id: `rollback_${hash({ runId, failedReceiptId }).substring(0, 16)}`,
    runId,
    failedReceiptId,
    rollbackReceipts,
    originalStateSnapshot: originalStatesOnly,
  };
}

export function runTopologyChain(runtime: TopologyRuntime, chain: TopologyChain): TopologyRun {
  const originalStateSnapshot: Record<string, { state: any; lastReceiptHash: string | null }> = {};
  for (const [id, node] of runtime.nodes.entries()) {
    originalStateSnapshot[id] = {
      state: JSON.parse(JSON.stringify(node.state)),
      lastReceiptHash: node.lastReceiptHash,
    };
  }

  const runId = `run_${hash({ chainId: chain.id, parentSeed: runtime.parentSeed }).substring(0, 16)}`;
  const run: TopologyRun = {
    id: runId,
    chainId: chain.id,
    receipts: [],
    status: "success",
  };

  runtime.runs.set(runId, run);

  try {
    const cascade = (
      delta: TopologyDelta,
      nodePath: string[],
      previousReceiptHash: string | null,
      depth: number,
      parentNodeId: string | null
    ) => {
      // 1. Depth breach check
      if (depth >= runtime.maxDepth) {
        const stepHash = hash({
          nodeId: "depth-breach",
          delta,
          previousReceiptHash,
          parentSeed: runtime.parentSeed,
        });
        const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
        const stepCtx = createDeterministicContext(stepSeed);

        const refuseReceipt = createReceipt(
          stepCtx,
          `evt_refused_${stepCtx.uuid()}`,
          delta.id,
          hash(delta),
          hash({ reason: "Max depth breach" }),
          previousReceiptHash,
          "refused"
        );

        const topoReceipt: TopologyReceipt = {
          ...refuseReceipt,
          nodeId: "depth-breach-refusal",
          depth,
          stateBefore: null,
          stateAfter: null,
        };

        run.receipts.push(topoReceipt);
        runtime.refusedReceipts.push(refuseReceipt);

        throw new Error(`Max depth breach: depth ${depth} >= ${runtime.maxDepth}`);
      }

      // 2. Find matching nodes
      const matchingNodes: TopologyNode[] = [];
      for (const node of runtime.nodes.values()) {
        if (matchesCondition(node.condition, delta)) {
          matchingNodes.push(node);
        }
      }

      for (const node of matchingNodes) {
        // 3. Hook storm check
        if (detectHookStorm(runtime, nodePath, node.id)) {
          const stepHash = hash({
            nodeId: node.id,
            delta,
            previousReceiptHash: previousReceiptHash,
            parentSeed: runtime.parentSeed,
          });
          const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
          const stepCtx = createDeterministicContext(stepSeed);

          const refuseReceipt = createReceipt(
            stepCtx,
            `evt_refused_${stepCtx.uuid()}`,
            delta.id,
            hash(delta),
            hash({ reason: "Cyclic hook storm detected" }),
            previousReceiptHash,
            "refused"
          );

          const topoReceipt: TopologyReceipt = {
            ...refuseReceipt,
            nodeId: node.id,
            depth,
            stateBefore: null,
            stateAfter: null,
          };

          run.receipts.push(topoReceipt);
          runtime.refusedReceipts.push(refuseReceipt);

          const storm: TopologyStorm = {
            id: `storm_${stepCtx.uuid()}`,
            detectedAt: Date.now(),
            path: [...nodePath, node.id],
            rootDeltaId: chain.rootDelta.id,
            reason: `Cyclic hook storm detected: Hook ${node.id} is already in the execution path`,
          };
          runtime.storms.push(storm);

          throw new Error(`Cyclic hook storm detected: Hook ${node.id} is already in the execution path`);
        }

        // 4. Trace edge if there is a parent node
        if (parentNodeId) {
          const edgeExists = runtime.edges.some(
            (e) => e.sourceId === parentNodeId && e.targetId === node.id
          );
          if (!edgeExists) {
            runtime.edges.push({
              sourceId: parentNodeId,
              targetId: node.id,
              triggerPredicate: delta.adds[0]?.predicate || delta.deletes[0]?.predicate || undefined,
            });
          }
        }

        // 5. Causal Entropy Normalization: step seed derived from inputs, previous receipt hash, and parent seed
        const stepHash = hash({
          nodeId: node.id,
          delta,
          previousReceiptHash: previousReceiptHash,
          parentSeed: runtime.parentSeed,
        });
        const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
        const stepCtx = createDeterministicContext(stepSeed);

        const stateBefore = JSON.parse(JSON.stringify(node.state));

        let behaviorResult: { nextState: any; effects: HookEffect[] };
        try {
          behaviorResult = node.behavior(stateBefore, delta, stepCtx);
        } catch (err: any) {
          const refuseReceipt = createReceipt(
            stepCtx,
            `evt_refused_${stepCtx.uuid()}`,
            delta.id,
            hash(delta),
            hash({ error: err.message }),
            previousReceiptHash,
            "refused"
          );

          const topoReceipt: TopologyReceipt = {
            ...refuseReceipt,
            nodeId: node.id,
            depth,
            stateBefore,
            stateAfter: null,
          };

          run.receipts.push(topoReceipt);
          runtime.refusedReceipts.push(refuseReceipt);

          throw new Error(`Hook ${node.id} execution failed: ${err.message}`);
        }

        // Update node state
        node.state = behaviorResult.nextState;

        const inputHash = hash({ delta, stateBefore });
        const outputHash = hash({ effects: behaviorResult.effects, stateAfter: behaviorResult.nextState });
        const eventId = `evt_${stepCtx.uuid()}`;

        const confirmedReceipt = createReceipt(
          stepCtx,
          eventId,
          delta.id,
          inputHash,
          outputHash,
          previousReceiptHash,
          "confirmed"
        );

        const topoReceipt: TopologyReceipt = {
          ...confirmedReceipt,
          nodeId: node.id,
          depth,
          stateBefore,
          stateAfter: behaviorResult.nextState,
        };

        node.lastReceiptHash = confirmedReceipt.receiptHash;
        run.receipts.push(topoReceipt);

        // Process downstream effects if any add-quad
        const adds = behaviorResult.effects
          .filter((e): e is { kind: "add-quad"; quad: any } => e.kind === "add-quad")
          .map((e) => e.quad);

        if (adds.length > 0) {
          const producedDelta: TopologyDelta = {
            id: stepCtx.uuid(),
            adds,
            deletes: [],
            parentDeltaId: delta.id,
          };

          // Limit delta chain size
          if (chain.deltas.length >= runtime.maxDeltas) {
            const refuseReceipt = createReceipt(
              stepCtx,
              `evt_refused_${stepCtx.uuid()}`,
              producedDelta.id,
              hash(producedDelta),
              hash({ reason: "Max emitted-delta count breach" }),
              confirmedReceipt.receiptHash,
              "refused"
            );

            const topoRefuseRcpt: TopologyReceipt = {
              ...refuseReceipt,
              nodeId: "delta-breach-refusal",
              depth: depth + 1,
              stateBefore: null,
              stateAfter: null,
            };

            run.receipts.push(topoRefuseRcpt);
            runtime.refusedReceipts.push(refuseReceipt);

            throw new Error(`Max emitted-delta count breach: ${chain.deltas.length + 1} > ${runtime.maxDeltas}`);
          }

          chain.deltas.push(producedDelta);

          // Recurse downstream
          cascade(
            producedDelta,
            [...nodePath, node.id],
            confirmedReceipt.receiptHash,
            depth + 1,
            node.id
          );
        }
      }
    };

    cascade(chain.rootDelta, [], null, 0, null);
    run.status = "success";
  } catch (error: any) {
    run.status = "failed";
    run.error = error.message;

    // Trigger rollback
    const failedReceiptId = run.receipts[run.receipts.length - 1]?.id || "unknown";
    rollbackTopologyChain(runtime, runId, failedReceiptId, originalStateSnapshot);
  }

  return run;
}

export function replayTopologyChain(
  runtime: TopologyRuntime,
  chain: TopologyChain,
  expectedRun: TopologyRun
): TopologyReplayReport {
  // 1. Identify and restore initial states of all nodes involved in expectedRun
  const initialStates: Record<string, { state: any; lastReceiptHash: string | null }> = {};

  for (const rcpt of expectedRun.receipts) {
    if (rcpt.nodeId !== "depth-breach-refusal" && rcpt.nodeId !== "depth-breach-refusal") {
      if (!(rcpt.nodeId in initialStates)) {
        initialStates[rcpt.nodeId] = {
          state: rcpt.stateBefore,
          lastReceiptHash: rcpt.previousReceiptHash,
        };
      }
    }
  }

  // Save current states to restore them afterwards
  const currentStates: Record<string, { state: any; lastReceiptHash: string | null }> = {};
  for (const id of runtime.nodes.keys()) {
    const node = runtime.nodes.get(id)!;
    currentStates[id] = {
      state: JSON.parse(JSON.stringify(node.state)),
      lastReceiptHash: node.lastReceiptHash,
    };

    if (id in initialStates) {
      node.state = JSON.parse(JSON.stringify(initialStates[id].state));
      node.lastReceiptHash = initialStates[id].lastReceiptHash;
    }
  }

  // 2. Rerun the chain
  const replayChain: TopologyChain = {
    id: chain.id,
    rootDelta: JSON.parse(JSON.stringify(chain.rootDelta)),
    deltas: [JSON.parse(JSON.stringify(chain.rootDelta))],
  };

  const replayRun = runTopologyChain(runtime, replayChain);

  // Restore current states so replay has no permanent side-effects
  for (const [id, snap] of Object.entries(currentStates)) {
    const node = runtime.nodes.get(id)!;
    node.state = snap.state;
    node.lastReceiptHash = snap.lastReceiptHash;
  }

  // 3. Verify convergence
  let replayConvergenceVerified = true;
  if (replayRun.status !== expectedRun.status) {
    replayConvergenceVerified = false;
  }
  if (replayRun.receipts.length !== expectedRun.receipts.length) {
    replayConvergenceVerified = false;
  } else {
    for (let i = 0; i < replayRun.receipts.length; i++) {
      const repRcpt = replayRun.receipts[i];
      const expRcpt = expectedRun.receipts[i];

      if (!verifyReceipt(expRcpt)) {
        replayConvergenceVerified = false;
      }
      if (repRcpt.receiptHash !== expRcpt.receiptHash) {
        replayConvergenceVerified = false;
      }
      if (JSON.stringify(repRcpt.stateAfter) !== JSON.stringify(expRcpt.stateAfter)) {
        replayConvergenceVerified = false;
      }
    }
  }

  const status = replayConvergenceVerified ? "passed" : "failed";

  // 4. Compute accounting
  const attempted = expectedRun.receipts.length;
  const succeeded = expectedRun.receipts.filter((r) => r.status === "confirmed").length;
  const refused = expectedRun.receipts.filter((r) => r.status === "refused").length;
  const failed = expectedRun.status === "failed" ? 1 : 0;
  const quarantined = 0;
  const skipped = 0;

  const getPct = (val: number) => (attempted === 0 ? 0 : parseFloat(((val / attempted) * 100).toFixed(3)));
  const getPctStr = (val: number) => `${getPct(val).toFixed(3)}%`;

  const accounting: TopologyAccounting = {
    attempted,
    succeeded,
    failed,
    refused,
    quarantined,
    skipped,
    successRatePct: getPct(succeeded),
    failureRatePct: getPct(failed),
    refusalRatePct: getPct(refused),
    quarantineRatePct: getPct(quarantined),
    successRatePctString: getPctStr(succeeded),
    failureRatePctString: getPctStr(failed),
    refusalRatePctString: getPctStr(refused),
    quarantineRatePctString: getPctStr(quarantined),
  };

  const reportHash = hash({
    case: "topology-causal-replay",
    status,
    runId: expectedRun.id,
    verifiedReceiptCount: expectedRun.receipts.length,
    replayConvergenceVerified,
    accounting,
  });

  return {
    case: "topology-causal-replay",
    status,
    runId: expectedRun.id,
    verifiedReceiptCount: expectedRun.receipts.length,
    replayConvergenceVerified,
    accounting,
    reportHash,
  };
}

export function generateTopologyReport(
  runtime: TopologyRuntime,
  run: TopologyRun,
  replayReport?: TopologyReplayReport
): any {
  const nodesSummary = Array.from(runtime.nodes.entries()).map(([id, node]) => ({
    id,
    name: node.name,
    lastReceiptHash: node.lastReceiptHash,
    state: node.state,
  }));

  const edgesSummary = runtime.edges.map((e) => ({
    source: e.sourceId,
    target: e.targetId,
    trigger: e.triggerPredicate,
  }));

  const stormsSummary = runtime.storms.map((s) => ({
    id: s.id,
    path: s.path,
    reason: s.reason,
  }));

  const reportData = {
    runId: run.id,
    status: run.status,
    receiptsCount: run.receipts.length,
    nodes: nodesSummary,
    edges: edgesSummary,
    storms: stormsSummary,
    replay: replayReport
      ? {
          status: replayReport.status,
          replayConvergenceVerified: replayReport.replayConvergenceVerified,
          accounting: replayReport.accounting,
          reportHash: replayReport.reportHash,
        }
      : null,
    timestamp: Date.now(),
  };

  const reportHash = hash(reportData);

  return {
    ...reportData,
    reportHash,
  };
}
