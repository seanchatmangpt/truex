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
    name: 'No stale report allowed',
    description: 'Every project report must have been updated recently and cannot be stale.',
    severity: 'warning',
    violationQuery: {
      id: 'q5',
      label: 'Find stale reports',
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
  }
];

export function evaluatePredicate(predicate: OcpqPredicate, binding: Record<string, any>, log: OcelV2Log): boolean {
  if (UNSUPPORTED_PREDICATES.includes(predicate.kind)) {
    throw new Error(`Unsupported predicate kind: ${predicate.kind}`);
  }
  if (!SUPPORTED_PREDICATES.includes(predicate.kind)) {
    throw new Error(`Unknown predicate kind: ${predicate.kind}`);
  }

  switch (predicate.kind) {
    case 'attribute': {
      const pred = predicate as OcpqAttributePredicate;
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
      const fromObj = binding[pred.fromVariable];
      const toObj = binding[pred.toVariable];
      if (!fromObj || !toObj) return false;

      // Check relationships array
      const rels = fromObj.relationships || [];
      return rels.some((r: any) => r.objectId === toObj.id && (!pred.qualifier || r.qualifier === pred.qualifier));
    }
    case 'temporal': {
      const pred = predicate as OcpqTemporalPredicate;
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
    default:
      throw new Error(`Unhandled predicate kind: ${predicate.kind}`);
  }
}

/**
 * Minimal constraint evaluator
 */
export function evaluateProjectConstraint(constraint: OcpqConstraint, log: OcelV2Log): OcpqViolation[] {
  const violations: OcpqViolation[] = [];

  // Implement simple check routines for core library constraints
  if (constraint.id === 'c-proof-command-missing') {
    // Check if there's a source file that does not have any successful proof command relationship
    for (const obj of log.objects) {
      if (obj.type === 'source_file') {
        const fileId = obj.id;
        // Search if a proof command exists with relation to it
        const hasProof = log.events.some(evt => 
          evt.type === 'proof_succeeded' &&
          evt.relationships.some(rel => rel.objectId === fileId)
        );
        if (!hasProof) {
          violations.push({
            constraintId: constraint.id,
            message: `Source file "${fileId}" has no verified proof commands.`,
            variablesBound: { f: fileId },
            severity: constraint.severity
          });
        }
      }
    }
  }

  if (constraint.id === 'c-checkpoint-accounting') {
    // Check if there is any checkpoint object lacking an accounting domain parameter
    for (const obj of log.objects) {
      if (obj.type === 'gall_checkpoint') {
        // If it's missing accounting domain attribute
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
    // Check if there is a handoff completed event before 12 hours from initialization event
    const initEvt = log.events.find(e => e.type === 'project_initialized');
    const handoffEvt = log.events.find(e => e.type === 'handoff_completed');

    if (initEvt && handoffEvt) {
      const initTime = new Date(initEvt.time).getTime();
      const handoffTime = new Date(handoffEvt.time).getTime();
      const diffHrs = (handoffTime - initTime) / (3600 * 1000);
      if (diffHrs < 12) {
        violations.push({
          constraintId: constraint.id,
          message: `Handoff completed prematurely at ${diffHrs.toFixed(4)} hours. Monotonic 12-hour release gate breached.`,
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
          // If no receipt relationship is present or receipt is missing
          const receiptRel = obj.relationships.find(r => r.qualifier === ('emitted' as Qualifier) || r.qualifier === ('parent_receipt' as Qualifier));
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
      return t > latest ? t : latest;
    }, 0);

    for (const obj of log.objects) {
      if (obj.type === 'report') {
        const updatedAtAttr = obj.attributes.find(a => a.name === 'updatedAt');
        if (updatedAtAttr && typeof updatedAtAttr.value === 'string') {
          const reportTime = new Date(updatedAtAttr.value).getTime();
          const diffMs = latestEvent - reportTime;
          if (diffMs > 2 * 3600 * 1000) {
            violations.push({
              constraintId: constraint.id,
              message: `Report "${obj.id}" is stale (updated ${(diffMs / 3600 / 1000).toFixed(2)} hours before latest event).`,
              variablesBound: { r: obj.id },
              severity: constraint.severity
            });
          }
        } else {
          violations.push({
            constraintId: constraint.id,
            message: `Report "${obj.id}" is missing "updatedAt" attribute.`,
            variablesBound: { r: obj.id },
            severity: constraint.severity
          });
        }
      }
    }
  }

  if (constraint.id === 'c-queue-starvation') {
    const latestEvent = log.events.reduce((latest, evt) => {
      const t = new Date(evt.time).getTime();
      return t > latest ? t : latest;
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
                message: `Mailbox message "${obj.id}" is starved in available state for ${(diffMs / 60 / 1000).toFixed(2)} minutes.`,
                variablesBound: { m: obj.id },
                severity: constraint.severity
              });
            }
          }
        }
      }
    }
  }

  return violations;
}
