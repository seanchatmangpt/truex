/**
 * @module runtime-law
 * @description Gall S₀/S₂: Core ontology and law definitions.
 * Defines the immutable structures for graphs, hooks, and receipts.
 */
/* eslint-disable unicorn/no-null, unicorn/no-array-callback-reference */
export type Quad = {
  subject: string;
  predicate: string;
  object: string;
  graph?: string | null;
};

export type GraphDelta = {
  id: string;
  adds: Quad[];
  deletes: Quad[];
};

export type HookCondition =
  | { kind: 'delta-match'; predicate: string }
  | { kind: 'always' };

export type HookEffect =
  | { kind: 'emit-event'; type: string }
  | { kind: 'add-quad'; quad: Quad };

export type HookDefinition = {
  id: string;
  name: string;
  condition: HookCondition;
  effects: HookEffect[];
};

export type HookEvent = {
  id: string;
  hookId: string;
  type: string;
  deltaId: string;
};

export type Receipt = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | null;
  status: 'confirmed' | 'refused';
  receiptHash: string;
  signature?: string;
  publicKey?: string;
  rollbackOf?: string;
  failedChildId?: string;
  reason?: string;
};

export type ReplayRequest = {
  delta: GraphDelta;
  expectedReceipt: Receipt;
};

// Runtime Law Parser Functions

export function parseQuad(input: unknown): Quad {
  if (!input || typeof input !== 'object') {
    throw new Error('Quad must be an object');
  }
  const q = input as Record<string, unknown>;
  if (typeof q.subject !== 'string' || !q.subject) {
    throw new Error('Quad.subject must be a non-empty string');
  }
  if (typeof q.predicate !== 'string' || !q.predicate) {
    throw new Error('Quad.predicate must be a non-empty string');
  }
  if (typeof q.object !== 'string' || !q.object) {
    throw new Error('Quad.object must be a non-empty string');
  }
  const graph = q.graph === undefined ? null : q.graph;
  if (graph !== null && typeof graph !== 'string') {
    throw new Error('Quad.graph must be a string or null');
  }
  return {
    subject: q.subject,
    predicate: q.predicate,
    object: q.object,
    graph: graph as string | null,
  };
}

export function parseGraphDelta(input: unknown): GraphDelta {
  if (!input || typeof input !== 'object') {
    throw new Error('GraphDelta must be an object');
  }
  const d = input as Record<string, unknown>;
  if (typeof d.id !== 'string' || !d.id) {
    throw new Error('GraphDelta.id must be a non-empty string');
  }
  if (!Array.isArray(d.adds)) {
    throw new TypeError('GraphDelta.adds must be an array');
  }
  if (!Array.isArray(d.deletes)) {
    throw new TypeError('GraphDelta.deletes must be an array');
  }
  return {
    id: d.id,
    adds: d.adds.map(parseQuad),
    deletes: d.deletes.map(parseQuad),
  };
}

export function parseHookCondition(input: unknown): HookCondition {
  if (!input || typeof input !== 'object') {
    throw new Error('HookCondition must be an object');
  }
  const c = input as Record<string, unknown>;
  if (c.kind === 'always') {
    return { kind: 'always' };
  }
  if (c.kind === 'delta-match') {
    if (typeof c.predicate !== 'string' || !c.predicate) {
      throw new Error('HookCondition of kind delta-match must specify a non-empty predicate');
    }
    return { kind: 'delta-match', predicate: c.predicate };
  }
  throw new Error(`Unknown HookCondition kind: ${c.kind}`);
}

export function parseHookEffect(input: unknown): HookEffect {
  if (!input || typeof input !== 'object') {
    throw new Error('HookEffect must be an object');
  }
  const e = input as Record<string, unknown>;
  if (e.kind === 'emit-event') {
    if (typeof e.type !== 'string' || !e.type) {
      throw new Error('HookEffect of kind emit-event must specify a non-empty event type');
    }
    return { kind: 'emit-event', type: e.type };
  }
  if (e.kind === 'add-quad') {
    return { kind: 'add-quad', quad: parseQuad(e.quad) };
  }
  throw new Error(`Unknown HookEffect kind: ${e.kind}`);
}

export function parseHookDefinition(input: unknown): HookDefinition {
  if (!input || typeof input !== 'object') {
    throw new Error('HookDefinition must be an object');
  }
  const h = input as Record<string, unknown>;
  if (typeof h.id !== 'string' || !h.id) {
    throw new Error('HookDefinition.id must be a non-empty string');
  }
  if (typeof h.name !== 'string' || !h.name) {
    throw new Error('HookDefinition.name must be a non-empty string');
  }
  if (!h.condition) {
    throw new Error('HookDefinition.condition is required');
  }
  if (!Array.isArray(h.effects)) {
    throw new TypeError('HookDefinition.effects must be an array');
  }
  return {
    id: h.id,
    name: h.name,
    condition: parseHookCondition(h.condition),
    effects: h.effects.map(parseHookEffect),
  };
}

export function parseReceipt(input: unknown): Receipt {
  if (!input || typeof input !== 'object') {
    throw new Error('Receipt must be an object');
  }
  const r = input as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) {
    throw new Error('Receipt.id must be a non-empty string');
  }
  if (typeof r.eventId !== 'string' || !r.eventId) {
    throw new Error('Receipt.eventId must be a non-empty string');
  }
  if (typeof r.deltaId !== 'string' || !r.deltaId) {
    throw new Error('Receipt.deltaId must be a non-empty string');
  }
  if (typeof r.inputHash !== 'string' || !r.inputHash) {
    throw new Error('Receipt.inputHash must be a non-empty string');
  }
  if (typeof r.outputHash !== 'string' || !r.outputHash) {
    throw new Error('Receipt.outputHash must be a non-empty string');
  }
  const previousReceiptHash = (r.previousReceiptHash === undefined || r.previousReceiptHash === null) ? null : r.previousReceiptHash;
  if (previousReceiptHash !== null && typeof previousReceiptHash !== 'string') {
    throw new Error('Receipt.previousReceiptHash must be a string or null');
  }
  if (r.status !== 'confirmed' && r.status !== 'refused') {
    throw new Error('Receipt.status must be "confirmed" or "refused"');
  }
  if (typeof r.receiptHash !== 'string' || !r.receiptHash) {
    throw new Error('Receipt.receiptHash must be a non-empty string');
  }
  const res: Receipt = {
    id: r.id,
    eventId: r.eventId,
    deltaId: r.deltaId,
    inputHash: r.inputHash,
    outputHash: r.outputHash,
    previousReceiptHash: previousReceiptHash as string | null,
    status: r.status,
    receiptHash: r.receiptHash,
  };

  if (typeof r.signature === 'string') res.signature = r.signature;
  if (typeof r.publicKey === 'string') res.publicKey = r.publicKey;
  if (typeof r.rollbackOf === 'string') res.rollbackOf = r.rollbackOf;
  if (typeof r.failedChildId === 'string') res.failedChildId = r.failedChildId;
  if (typeof r.reason === 'string') res.reason = r.reason;

  return res;
}

export function parseReplayRequest(input: unknown): ReplayRequest {
  if (!input || typeof input !== 'object') {
    throw new Error('ReplayRequest must be an object');
  }
  const req = input as Record<string, unknown>;
  return {
    delta: parseGraphDelta(req.delta),
    expectedReceipt: parseReceipt(req.expectedReceipt),
  };
}

export type CountAccounting = {
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
};

export type AccountingInput = {
  attempted: number;
  succeeded: number;
  failed: number;
  refused: number;
  quarantined: number;
  skipped: number;
};

export function computeAccounting(counts: AccountingInput): CountAccounting {
  const attempted = counts.attempted;
  const getPct = (val: number) => attempted === 0 ? 0.000 : parseFloat(((val / attempted) * 100).toFixed(3));
  const getPctStr = (val: number) => `${getPct(val).toFixed(3)}%`;

  return {
    attempted: counts.attempted,
    succeeded: counts.succeeded,
    failed: counts.failed,
    refused: counts.refused,
    quarantined: counts.quarantined,
    skipped: counts.skipped,
    successRatePct: getPct(counts.succeeded),
    failureRatePct: getPct(counts.failed),
    refusalRatePct: getPct(counts.refused),
    quarantineRatePct: getPct(counts.quarantined),
    successRatePctString: getPctStr(counts.succeeded),
    failureRatePctString: getPctStr(counts.failed),
    refusalRatePctString: getPctStr(counts.refused),
    quarantineRatePctString: getPctStr(counts.quarantined)
  };
}

