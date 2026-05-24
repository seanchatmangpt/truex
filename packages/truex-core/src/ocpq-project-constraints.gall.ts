/**
 * @module OcpqProjectConstraints
 * @description
 * Gall Classification: Gall S12 (OCPQ Constraint Evaluator)
 * Purpose: Evaluates compliance constraints over projected OCEL logs.
 */

import {
  OcpqConstraint,
  OcelV2Log,
  OcpqPredicate,
  OcpqNestedQuery,
  Qualifier
} from './ocel2-project-types.js';

export interface OcpqViolation {
  readonly constraintId: string;
  readonly message: string;
  readonly variablesBound: Record<string, string>;
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
}

export const SUPPORTED_PREDICATES = ['attribute', 'relationship', 'temporal', 'and', 'or', 'not'];

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
        { id: 'f', kind: 'object', type: 'source_file' },
        { id: 'p', kind: 'event', type: 'proof_failed' }
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
      variables: [{ id: 'cp', kind: 'object', type: 'gall_checkpoint' }],
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
      variables: [{ id: 'e', kind: 'event', type: 'handoff_completed' }],
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
      variables: [{ id: 'm', kind: 'object', type: 'mailbox_message' }],
      predicates: [],
      children: []
    }
  }
];

export function evaluatePredicate(predicate: OcpqPredicate, binding: Record<string, any>, log: OcelV2Log): boolean {
  if (!SUPPORTED_PREDICATES.includes(predicate.kind)) {
    throw new Error(`Unsupported predicate kind: ${predicate.kind}`);
  }

  switch (predicate.kind) {
    case 'attribute': {
      const val = binding[predicate.variable]?.[predicate.attribute];
      if (predicate.op === 'exists') return val !== undefined && val !== null;
      if (predicate.op === 'eq') return val === predicate.value;
      if (predicate.op === 'neq') return val !== predicate.value;
      return false;
    }
    case 'relationship': {
      const fromObj = binding[predicate.fromVariable];
      const toObj = binding[predicate.toVariable];
      if (!fromObj || !toObj) return false;

      // Check relationships array
      const rels = fromObj.relationships || [];
      return rels.some((r: any) => r.objectId === toObj.id && (!predicate.qualifier || r.qualifier === predicate.qualifier));
    }
    case 'temporal': {
      const leftEvent = binding[predicate.leftEventVariable];
      const rightEvent = binding[predicate.rightEventVariable];
      if (!leftEvent || !rightEvent) return false;

      const leftTime = new Date(leftEvent.time).getTime();
      const rightTime = new Date(rightEvent.time).getTime();

      if (predicate.op === 'before') return leftTime < rightTime;
      if (predicate.op === 'after') return leftTime > rightTime;
      if (predicate.op === 'sameTime') return leftTime === rightTime;
      return false;
    }
    default:
      return false;
  }
}

/**
 * Minimal constraint evaluator
 */
export function evaluateProjectConstraint(constraint: OcpqConstraint, log: OcelV2Log): OcpqViolation[] {
  const violations: OcpqViolation[] = [];

  // Implement simple check routines for the 4 core library constraints
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

  return violations;
}
