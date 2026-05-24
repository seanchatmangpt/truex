import { describe, it, expect } from 'vitest';
import {
  evaluateProjectConstraint,
  evaluatePredicate,
  PROJECT_CONSTRAINTS
} from '../../src/ocpq-project-constraints.gall.js';
import type {
  OcelV2Log,
  OcelId,
  OcelTypeName,
  ISODateTime,
  OcpqPredicate,
  OcpqAttributePredicate,
  OcpqTemporalPredicate
} from '../../src/ocel2-project-types.js';

describe('OCPQ Constraints Gap & Adversarial Verification', () => {

  // 1. Clean log fixture where all constraints must pass with 0 violations
  const cleanLog: OcelV2Log = {
    eventTypes: [],
    objectTypes: [],
    events: [
      {
        id: 'evt_init' as OcelId,
        type: 'project_initialized' as OcelTypeName,
        time: '2026-05-24T00:00:00Z' as ISODateTime,
        attributes: [],
        relationships: []
      },
      {
        id: 'evt_proof' as OcelId,
        type: 'proof_succeeded' as OcelTypeName,
        time: '2026-05-24T01:00:00Z' as ISODateTime,
        attributes: [],
        relationships: [
          { objectId: 'index.ts' as OcelId, qualifier: 'proved_by' as any }
        ]
      },
      {
        id: 'evt_handoff' as OcelId,
        type: 'handoff_completed' as OcelTypeName,
        time: '2026-05-24T13:00:00Z' as ISODateTime,
        attributes: [],
        relationships: []
      }
    ],
    objects: [
      {
        id: 'index.ts' as OcelId,
        type: 'source_file' as OcelTypeName,
        attributes: [],
        relationships: []
      },
      {
        id: 'cp_1' as OcelId,
        type: 'gall_checkpoint' as OcelTypeName,
        attributes: [
          { name: 'purpose', value: 'governance_proving', time: '2026-05-24T00:30:00Z' as ISODateTime }
        ],
        relationships: []
      },
      {
        id: 'msg_1' as OcelId,
        type: 'mailbox_message' as OcelTypeName,
        attributes: [
          { name: 'state', value: 'confirmed', time: '2026-05-24T01:30:00Z' as ISODateTime }
        ],
        relationships: [
          { objectId: 'receipt_1' as OcelId, qualifier: 'emitted' as any }
        ]
      },
      {
        id: 'rep_1' as OcelId,
        type: 'report' as OcelTypeName,
        attributes: [
          { name: 'updatedAt', value: '2026-05-24T12:30:00Z', time: '2026-05-24T12:30:00Z' as ISODateTime }
        ],
        relationships: []
      },
      {
        id: 'msg_avail_recent' as OcelId,
        type: 'mailbox_message' as OcelTypeName,
        attributes: [
          { name: 'state', value: 'available', time: '2026-05-24T12:55:00Z' as ISODateTime },
          { name: 'availableAt', value: '2026-05-24T12:55:00Z', time: '2026-05-24T12:55:00Z' as ISODateTime }
        ],
        relationships: []
      }
    ]
  };

  it('should find 0 violations in a clean/perfect log conforming to all constraints', () => {
    for (const constraint of PROJECT_CONSTRAINTS) {
      const violations = evaluateProjectConstraint(constraint, cleanLog);
      expect(violations).toEqual([]);
    }
  });

  // 2. Adversarial Governance Failures Tests
  it('should detect violation: changed file without proof (c-proof-command-missing)', () => {
    // index.ts has no successful proof event relation
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [],
      objects: [
        {
          id: 'index.ts' as OcelId,
          type: 'source_file' as OcelTypeName,
          attributes: [],
          relationships: []
        }
      ]
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-proof-command-missing');
    expect(violations[0].variablesBound.f).toBe('index.ts');
  });

  it('should detect violation: checkpoint without domain (c-checkpoint-accounting)', () => {
    // cp_1 is missing 'purpose' mapping attribute
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [],
      objects: [
        {
          id: 'cp_1' as OcelId,
          type: 'gall_checkpoint' as OcelTypeName,
          attributes: [],
          relationships: []
        }
      ]
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-checkpoint-accounting')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-checkpoint-accounting');
    expect(violations[0].variablesBound.cp).toBe('cp_1');
  });

  it('should detect violation: handoff before 12h gate (c-handoff-timing)', () => {
    // diff between init and handoff is only 2 hours
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [
        {
          id: 'evt_init' as OcelId,
          type: 'project_initialized' as OcelTypeName,
          time: '2026-05-24T00:00:00Z' as ISODateTime,
          attributes: [],
          relationships: []
        },
        {
          id: 'evt_handoff' as OcelId,
          type: 'handoff_completed' as OcelTypeName,
          time: '2026-05-24T02:00:00Z' as ISODateTime,
          attributes: [],
          relationships: []
        }
      ],
      objects: []
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-handoff-timing')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-handoff-timing');
    expect(violations[0].variablesBound.e).toBe('evt_handoff');
  });

  it('should detect violation: terminal message missing receipt (c-mailbox-receipt-missing)', () => {
    // msg_1 is confirmed but lacks cryptographic receipt link
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [],
      objects: [
        {
          id: 'msg_1' as OcelId,
          type: 'mailbox_message' as OcelTypeName,
          attributes: [
            { name: 'state', value: 'confirmed', time: '2026-05-24T01:30:00Z' as ISODateTime }
          ],
          relationships: [] // missing receipt relationship
        }
      ]
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-mailbox-receipt-missing')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-mailbox-receipt-missing');
    expect(violations[0].variablesBound.m).toBe('msg_1');
  });

  it('should detect violation: stale report (c-stale-report)', () => {
    // rep_1 updatedAt is 5 hours before latest event
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [
        {
          id: 'evt_tick' as OcelId,
          type: 'project_initialized' as OcelTypeName,
          time: '2026-05-24T05:00:00Z' as ISODateTime,
          attributes: [],
          relationships: []
        }
      ],
      objects: [
        {
          id: 'rep_1' as OcelId,
          type: 'report' as OcelTypeName,
          attributes: [
            { name: 'updatedAt', value: '2026-05-24T00:00:00Z', time: '2026-05-24T00:00:00Z' as ISODateTime }
          ],
          relationships: []
        }
      ]
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-stale-report')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-stale-report');
    expect(violations[0].variablesBound.r).toBe('rep_1');
    expect(violations[0].message).toContain('stale');
  });

  it('should detect violation: queue starvation (c-queue-starvation)', () => {
    // msg_starved has been in available state for 20 minutes before latest event
    const badLog: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [
        {
          id: 'evt_tick' as OcelId,
          type: 'project_initialized' as OcelTypeName,
          time: '2026-05-24T01:00:00Z' as ISODateTime,
          attributes: [],
          relationships: []
        }
      ],
      objects: [
        {
          id: 'msg_starved' as OcelId,
          type: 'mailbox_message' as OcelTypeName,
          attributes: [
            { name: 'state', value: 'available', time: '2026-05-24T00:30:00Z' as ISODateTime },
            { name: 'availableAt', value: '2026-05-24T00:30:00Z', time: '2026-05-24T00:30:00Z' as ISODateTime }
          ],
          relationships: []
        }
      ]
    };
    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-queue-starvation')!;
    const violations = evaluateProjectConstraint(constraint, badLog);
    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-queue-starvation');
    expect(violations[0].variablesBound.m).toBe('msg_starved');
    expect(violations[0].message).toContain('starved');
  });

  // 3. Refusing Unsupported Predicates / Operators Tests
  it('should throw error when encountering unsupported predicate kind', () => {
    const log: OcelV2Log = { eventTypes: [], objectTypes: [], events: [], objects: [] };
    const p1: OcpqPredicate = {
      kind: 'and' as any,
      predicates: []
    };
    expect(() => evaluatePredicate(p1, {}, log)).toThrow('Unsupported predicate kind: and');

    const p2: OcpqPredicate = {
      kind: 'implies' as any,
      predicates: []
    };
    expect(() => evaluatePredicate(p2, {}, log)).toThrow('Unsupported predicate kind: implies');

    const p3: OcpqPredicate = {
      kind: 'unknown' as any
    } as any;
    expect(() => evaluatePredicate(p3, {}, log)).toThrow('Unknown predicate kind: unknown');
  });

  it('should throw error when encountering unsupported attribute comparison operator', () => {
    const log: OcelV2Log = { eventTypes: [], objectTypes: [], events: [], objects: [] };
    const p: OcpqAttributePredicate = {
      kind: 'attribute',
      variable: 'x',
      attribute: 'age',
      op: 'lt', // unsupported operator
      value: 18
    };
    expect(() => evaluatePredicate(p, { x: { age: 10 } }, log)).toThrow('Unsupported attribute comparison operator: lt');
  });

  it('should throw error when encountering unsupported temporal operator', () => {
    const log: OcelV2Log = { eventTypes: [], objectTypes: [], events: [], objects: [] };
    const p: OcpqTemporalPredicate = {
      kind: 'temporal',
      leftEventVariable: 'e1',
      op: 'within', // unsupported temporal operator
      rightEventVariable: 'e2',
      durationMs: 1000
    };
    expect(() => evaluatePredicate(p, { e1: { time: '2026-05-24T00:00:00Z' }, e2: { time: '2026-05-24T00:00:05Z' } }, log)).toThrow('Unsupported temporal operator: within');
  });
});
