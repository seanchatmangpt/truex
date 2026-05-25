/**
 * @module OcpqProjectConstraints
 * @description
 * Gall Classification: Gall S12 (OCPQ Constraint Evaluator)
 * Purpose: Evaluates compliance constraints over projected OCEL logs.
 */

import type {
  OcelV2Log,
  OcelTypeName,
  OcelAttributeValue,
  Qualifier,
  OcelId,
  ISODateTime,
  OcpqConstraint,
  OcpqPredicate,
  OcpqRelationshipPredicate,
  OcpqTemporalPredicate,
  OcpqNestedQuery,
  OcpqVariable,
  OcpqVariableKind,
  OcpqComparisonOp,
  OcpqAttributePredicate,
  OcpqLogicalPredicate
} from './ocel2-project-types.js';

export interface OcpqViolation {
  readonly constraintId: string;
  readonly message: string;
  readonly variablesBound: Record<string, string>;
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface OcpqConstraintReport {
  violations: OcpqViolation[];
  accounting: {
    attempted: number;
    passed: number;
    violated: number;
    refused: number;
    failed: number;
  };
}

export const SUPPORTED_PREDICATES = ['attribute', 'relationship', 'temporal'];
export const UNSUPPORTED_PREDICATES = ['and', 'or', 'not', 'implies'];

export const SUPPORTED_ATTRIBUTE_OPS = ['exists', 'eq', 'neq'];
export const UNSUPPORTED_ATTRIBUTE_OPS = ['lt', 'lte', 'gt', 'gte', 'contains', 'startsWith', 'endsWith'];

export const SUPPORTED_TEMPORAL_OPS = ['before', 'after', 'sameTime'];
export const UNSUPPORTED_TEMPORAL_OPS = ['within'];

/**
 * Standard project constraints library
 */
export const PROJECT_CONSTRAINTS: OcpqConstraint[] = [
  {
    id: 'c-proof-command-missing',
    name: 'No changed file without proof',
    description: 'Every source file change must have a subsequent proof command executed.',
    severity: 'error',
    violationQuery: {
      id: 'q1',
      label: 'Find unproven file changes',
      quantifier: 'exists',
      variables: [
        { id: 'f', kind: 'object', type: 'source_file' as OcelTypeName },
        { id: 'p', kind: 'event', type: 'proof_failed' as OcelTypeName }
      ],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-checkpoint-accounting',
    name: 'No checkpoint without accounting domain',
    description: 'Every accepted checkpoint must bind to a registered accounting domain.',
    severity: 'critical',
    violationQuery: {
      id: 'q2',
      label: 'Find checkpoints without accounting',
      quantifier: 'exists',
      variables: [{ id: 'cp', kind: 'object', type: 'gall_checkpoint' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-handoff-timing',
    name: 'No handoff before 12-hour gate',
    description: 'Handoff events must not occur before 12 hours from project init.',
    severity: 'critical',
    violationQuery: {
      id: 'q3',
      label: 'Find premature handoffs',
      quantifier: 'exists',
      variables: [{ id: 'e', kind: 'event', type: 'handoff_completed' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-mailbox-receipt-missing',
    name: 'No terminal mailbox state without receipt',
    description: 'Every confirmed or refused message must record a receipt hash reference.',
    severity: 'error',
    violationQuery: {
      id: 'q4',
      label: 'Find unreceipted terminal messages',
      quantifier: 'exists',
      variables: [{ id: 'm', kind: 'object', type: 'mailbox_message' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-stale-report',
    name: 'No stale report referencing missing artifact allowed',
    description: 'Every project report must not be stale while referencing a missing artifact.',
    severity: 'warning',
    violationQuery: {
      id: 'q5',
      label: 'Find stale reports missing artifacts',
      quantifier: 'exists',
      variables: [{ id: 'r', kind: 'object', type: 'report' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-queue-starvation',
    name: 'No queue starvation allowed',
    description: 'Available messages in queue must not remain uncompleted or unclaimed for more than 10 minutes.',
    severity: 'error',
    violationQuery: {
      id: 'q6',
      label: 'Find starved queue messages',
      quantifier: 'exists',
      variables: [{ id: 'm', kind: 'object', type: 'mailbox_message' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-completion-accounting',
    name: 'No completion claim with failed accounting',
    description: 'Project completion cannot be claimed if accounting domain is failed.',
    severity: 'critical',
    violationQuery: {
      id: 'q7',
      label: 'Find invalid completion claims',
      quantifier: 'exists',
      variables: [{ id: 'cc', kind: 'event', type: 'completion_claim' as OcelTypeName }],
      predicates: [],
      children: []
    }
  },
  {
    id: 'c-proof-after-failure',
    name: 'No proof success after failure without rerun',
    description: 'A file cannot have a successful proof immediately after a failure without an intervening file change.',
    severity: 'error',
    violationQuery: {
      id: 'q8',
      label: 'Find fake proof successes',
      quantifier: 'exists',
      variables: [{ id: 'f', kind: 'object', type: 'source_file' as OcelTypeName }],
      predicates: [],
      children: []
    }
  }
];

export function evaluatePredicate(predicate: OcpqPredicate, binding: Record<string, any>, log: OcelV2Log): boolean {
  if (!predicate || !predicate.kind) {
    throw new Error("Malformed predicate");
  }
  if (UNSUPPORTED_PREDICATES.includes(predicate.kind)) {
    throw new Error(`Unsupported predicate kind: ${predicate.kind}`);
  }
  if (!SUPPORTED_PREDICATES.includes(predicate.kind)) {
    throw new Error(`Unknown predicate kind: ${predicate.kind}`);
  }

  switch (predicate.kind) {
    case 'attribute': {
      const pred = predicate as OcpqAttributePredicate;
      if (!pred.variable || !pred.attribute || !pred.op) {
        throw new Error("Malformed predicate");
      }
      if (UNSUPPORTED_ATTRIBUTE_OPS.includes(pred.op)) {
        throw new Error(`Unsupported attribute comparison operator: ${pred.op}`);
      }
      if (!SUPPORTED_ATTRIBUTE_OPS.includes(pred.op)) {
        throw new Error(`Unknown attribute comparison operator: ${pred.op}`);
      }
      const val = binding[pred.variable]?.[pred.attribute];
      if (pred.op === 'exists') return val !== undefined && val !== null;
      if (pred.op === 'eq') return val === pred.value;
      if (pred.op === 'neq') return val !== pred.value;
      return false;
    }
    case 'relationship': {
      const pred = predicate as OcpqRelationshipPredicate;
      if (!pred.fromVariable || !pred.toVariable) {
        throw new Error("Malformed predicate");
      }
      const fromObj = binding[pred.fromVariable];
      const toObj = binding[pred.toVariable];
      if (!fromObj || !toObj) return false;

      const rels = fromObj.relationships || [];
      return rels.some((r: any) => r.objectId === toObj.id && (!pred.qualifier || r.qualifier === pred.qualifier));
    }
    case 'temporal': {
      const pred = predicate as OcpqTemporalPredicate;
      if (!pred.leftEventVariable || !pred.rightEventVariable || !pred.op) {
        throw new Error("Malformed predicate");
      }
      if (UNSUPPORTED_TEMPORAL_OPS.includes(pred.op)) {
        throw new Error(`Unsupported temporal operator: ${pred.op}`);
      }
      if (!SUPPORTED_TEMPORAL_OPS.includes(pred.op)) {
        throw new Error(`Unknown temporal operator: ${pred.op}`);
      }
      const leftEvent = binding[pred.leftEventVariable];
      const rightEvent = binding[pred.rightEventVariable];
      if (!leftEvent || !rightEvent) return false;

      const leftTime = new Date(leftEvent.time).getTime();
      const rightTime = new Date(rightEvent.time).getTime();

      if (pred.op === 'before') return leftTime < rightTime;
      if (pred.op === 'after') return leftTime > rightTime;
      if (pred.op === 'sameTime') return leftTime === rightTime;
      return false;
    }
    default: {
      throw new Error(`Unhandled predicate kind: ${predicate.kind}`);
    }
  }
}

export function validateNestedQuery(query: OcpqNestedQuery, log: OcelV2Log): void {
  if (!query) {
    throw new Error("Malformed nested query");
  }
  if (!query.id || !query.quantifier || !query.variables) {
    throw new Error("Malformed nested query");
  }
  for (const v of query.variables) {
    if (!v || !v.id || !v.kind) {
      throw new Error("Malformed nested query");
    }
  }
  if (query.predicates) {
    for (const pred of query.predicates) {
      evaluatePredicate(pred, {}, log);
    }
  }
  if (query.children) {
    for (const child of query.children) {
      validateNestedQuery(child, log);
    }
  }
}

export function evaluateProjectConstraint(constraint: OcpqConstraint, log: OcelV2Log): OcpqViolation[] {
  const violations: OcpqViolation[] = [];

  if (!constraint || !constraint.violationQuery) {
    throw new Error("Malformed nested query");
  }
  validateNestedQuery(constraint.violationQuery, log);

  if (constraint.id === 'c-proof-command-missing') {
    for (const obj of log.objects) {
      if (obj.type === 'source_file') {
        const fileId = obj.id;
        const changeEvents = log.events.filter(e => e.type === 'file_changed' && e.relationships.some(r => r.objectId === fileId));
        const proofEvents = log.events.filter(e => e.type === 'proof_succeeded' && e.relationships.some(r => r.objectId === fileId));
        
        if (changeEvents.length > 0) {
          const latestChange = Math.max(...changeEvents.map(e => new Date(e.time).getTime()));
          const hasLaterProof = proofEvents.some(e => new Date(e.time).getTime() > latestChange);
          
          if (!hasLaterProof) {
            violations.push({
              constraintId: constraint.id,
              message: `Source file "${fileId}" has no verified proof commands after latest change.`,
              variablesBound: { f: fileId },
              severity: constraint.severity
            });
          }
        }
      }
    }
  }

  if (constraint.id === 'c-checkpoint-accounting') {
    for (const obj of log.objects) {
      if (obj.type === 'gall_checkpoint') {
        const purposeAttr = obj.attributes.find(a => a.name === 'purpose');
        if (!purposeAttr || !purposeAttr.value) {
          violations.push({
            constraintId: constraint.id,
            message: `Checkpoint "${obj.id}" is missing target purpose or accounting mapping.`,
            variablesBound: { cp: obj.id },
            severity: constraint.severity
          });
        }
      }
    }
  }

  if (constraint.id === 'c-handoff-timing') {
    const initEvt = log.events.find(e => e.type === 'project_initialized');
    const handoffEvt = log.events.find(e => e.type === 'handoff_completed');

    if (initEvt && handoffEvt) {
      const initTime = new Date(initEvt.time).getTime();
      const handoffTime = new Date(handoffEvt.time).getTime();
      const diffHrs = (handoffTime - initTime) / (3600 * 1000);
      if (diffHrs < 12) {
        violations.push({
          constraintId: constraint.id,
          message: `Handoff completed prematurely at ${diffHrs.toFixed(4)} hours.`,
          variablesBound: { e: handoffEvt.id },
          severity: constraint.severity
        });
      }
    }
  }

  if (constraint.id === 'c-mailbox-receipt-missing') {
    for (const obj of log.objects) {
      if (obj.type === 'mailbox_message') {
        const stateAttr = obj.attributes.find(a => a.name === 'state');
        if (stateAttr && (stateAttr.value === 'confirmed' || stateAttr.value === 'refused')) {
          const receiptRel = obj.relationships.find(r => r.qualifier === 'emitted' || r.qualifier === 'parent_receipt');
          if (!receiptRel) {
            violations.push({
              constraintId: constraint.id,
              message: `Terminal mailbox message "${obj.id}" is missing standard cryptographic receipt linkage.`,
              variablesBound: { m: obj.id },
              severity: constraint.severity
            });
          }
        }
      }
    }
  }

  if (constraint.id === 'c-stale-report') {
    const latestEvent = log.events.reduce((latest, evt) => {
      const t = new Date(evt.time).getTime();
      return Math.max(t, latest);
    }, 0);

    for (const obj of log.objects) {
      if (obj.type === 'report') {
        const updatedAtAttr = obj.attributes.find(a => a.name === 'updatedAt');
        let isStale = false;
        if (updatedAtAttr && typeof updatedAtAttr.value === 'string') {
          const reportTime = new Date(updatedAtAttr.value).getTime();
          const diffMs = latestEvent - reportTime;
          if (diffMs > 2 * 3600 * 1000) {
            isStale = true;
          }
        } else {
          isStale = true;
        }

        if (isStale) {
          // Check for missing artifact reference
          const hasMissingArtifact = obj.relationships.some(rel => {
            const relObj = log.objects.find(o => o.id === rel.objectId);
            return !relObj || relObj.attributes.some(a => a.name === 'state' && a.value === 'missing');
          });

          if (hasMissingArtifact) {
            violations.push({
              constraintId: constraint.id,
              message: `Report "${obj.id}" is stale and references a missing artifact.`,
              variablesBound: { r: obj.id },
              severity: constraint.severity
            });
          }
        }
      }
    }
  }

  if (constraint.id === 'c-queue-starvation') {
    const latestEvent = log.events.reduce((latest, evt) => {
      const t = new Date(evt.time).getTime();
      return Math.max(t, latest);
    }, 0);

    for (const obj of log.objects) {
      if (obj.type === 'mailbox_message') {
        const stateAttr = obj.attributes.find(a => a.name === 'state');
        if (stateAttr && stateAttr.value === 'available') {
          const availableAtAttr = obj.attributes.find(a => a.name === 'availableAt');
          if (availableAtAttr && typeof availableAtAttr.value === 'string') {
            const availTime = new Date(availableAtAttr.value).getTime();
            const diffMs = latestEvent - availTime;
            if (diffMs > 10 * 60 * 1000) {
              violations.push({
                constraintId: constraint.id,
                message: `Mailbox message "${obj.id}" is starved in available state.`,
                variablesBound: { m: obj.id },
                severity: constraint.severity
              });
            }
          }
        }
      }
    }
  }

  if (constraint.id === 'c-completion-accounting') {
    const completionEvts = log.events.filter(e => e.type === 'completion_claim');
    if (completionEvts.length > 0) {
      // Check accounting domains
      const failedAccounting = log.objects.some(o => o.type === 'accounting_domain' && o.attributes.some(a => a.name === 'state' && a.value === 'failed'));
      if (failedAccounting) {
        for (const evt of completionEvts) {
          violations.push({
            constraintId: constraint.id,
            message: `Completion claim "${evt.id}" rejected due to failed accounting domain.`,
            variablesBound: { cc: evt.id },
            severity: constraint.severity
          });
        }
      }
    }
  }

  if (constraint.id === 'c-proof-after-failure') {
    for (const obj of log.objects) {
      if (obj.type === 'source_file') {
        const fileId = obj.id;
        const fileEvts = log.events.filter(e => e.relationships.some(r => r.objectId === fileId));
        fileEvts.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        let lastProofFailed = false;
        for (const e of fileEvts) {
          switch (e.type) {
          case 'proof_failed': {
            lastProofFailed = true;
          
          break;
          }
          case 'file_changed': {
            lastProofFailed = false;
          
          break;
          }
          case 'proof_succeeded': {
            if (lastProofFailed) {
              violations.push({
                constraintId: constraint.id,
                message: `Source file "${fileId}" had a proof success after failure without a change.`,
                variablesBound: { f: fileId },
                severity: constraint.severity
              });
            }
            lastProofFailed = false;
          
          break;
          }
          // No default
          }
        }
      }
    }
  }

  return violations;
}

export function evaluateProjectConstraintsAll(log: OcelV2Log, constraints: OcpqConstraint[] = PROJECT_CONSTRAINTS): OcpqConstraintReport {
  const report: OcpqConstraintReport = {
    violations: [],
    accounting: {
      attempted: 0,
      passed: 0,
      violated: 0,
      refused: 0,
      failed: 0
    }
  };

  for (const c of constraints) {
    report.accounting.attempted++;
    try {
      const v = evaluateProjectConstraint(c, log);
      if (v.length > 0) {
        report.accounting.violated++;
        report.violations.push(...v);
      } else {
        report.accounting.passed++;
      }
    } catch (error_: any) {
      if (error_.message.includes('Unsupported') || error_.message.includes('Unknown') || error_.message.includes('Malformed')) {
        report.accounting.refused++;
      } else {
        report.accounting.failed++;
      }
    }
  }

  return report;
}
