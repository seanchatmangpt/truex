import { describe, it, expect } from 'vitest';
import {
  evaluateProjectConstraint,
  evaluateProjectConstraintsAll,
  PROJECT_CONSTRAINTS,
  evaluatePredicate
} from '../../src/ocpq-project-constraints.gall.js';
import type { OcelV2Log, OcelId, OcelTypeName, ISODateTime, Qualifier, OcpqConstraint } from '../../src/ocel2-project-types.js';

describe('OCPQ Constraint Gap Coverage', () => {

  // 1. c-proof-command-missing tests
  describe('c-proof-command-missing', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-proof-command-missing')!;

    it('violates when file has changes but no subsequent proof succeeded', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.f).toBe('f1');
    });

    it('passes when file has changes followed by proof success', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] },
          { id: 'e2' as OcelId, type: 'proof_succeeded' as OcelTypeName, time: '2026-05-24T10:05:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'proved' as Qualifier }] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });

    it('passes when file has no changes', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 2. c-checkpoint-accounting tests
  describe('c-checkpoint-accounting', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-checkpoint-accounting')!;

    it('violates when checkpoint lacks purpose attribute', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'cp1' as OcelId, type: 'gall_checkpoint' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.cp).toBe('cp1');
    });

    it('passes when checkpoint has purpose attribute', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'cp1' as OcelId, type: 'gall_checkpoint' as OcelTypeName,
            attributes: [{ name: 'purpose', value: 'Verify OCPQ evaluator', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 3. c-handoff-timing tests
  describe('c-handoff-timing', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-handoff-timing')!;

    it('violates when handoff occurs before 12 hours from init', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [], objects: [],
        events: [
          { id: 'e1' as OcelId, type: 'project_initialized' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime, attributes: [], relationships: [] },
          { id: 'e2' as OcelId, type: 'handoff_completed' as OcelTypeName, time: '2026-05-24T18:00:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.e).toBe('e2');
    });

    it('passes when handoff occurs after 12 hours from init', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [], objects: [],
        events: [
          { id: 'e1' as OcelId, type: 'project_initialized' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime, attributes: [], relationships: [] },
          { id: 'e2' as OcelId, type: 'handoff_completed' as OcelTypeName, time: '2026-05-25T10:00:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 4. c-mailbox-receipt-missing tests
  describe('c-mailbox-receipt-missing', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-mailbox-receipt-missing')!;

    it('violates when message is terminal (confirmed) but lacks receipt qualifier', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [{ name: 'state', value: 'confirmed', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.m).toBe('m1');
    });

    it('passes when message is terminal (confirmed) and has emitted qualifier', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [{ name: 'state', value: 'confirmed', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: [{ objectId: 'rcpt1' as OcelId, qualifier: 'emitted' as Qualifier }]
          }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });

    it('passes when message is terminal (refused) and has parent_receipt qualifier', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [{ name: 'state', value: 'refused', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: [{ objectId: 'rcpt1' as OcelId, qualifier: 'parent_receipt' as Qualifier }]
          }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });

    it('passes when message is in non-terminal state (available) without receipt', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [{ name: 'state', value: 'available', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: []
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 5. c-stale-report tests
  describe('c-stale-report', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-stale-report')!;

    it('violates when report is stale (> 2 hours old) and references a missing artifact', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'r1' as OcelId, type: 'report' as OcelTypeName,
            attributes: [{ name: 'updatedAt', value: '2026-05-24T10:00:00Z', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: [{ objectId: 'a1' as OcelId, qualifier: 'references' as Qualifier }]
          },
          {
            id: 'a1' as OcelId, type: 'artifact' as OcelTypeName,
            attributes: [{ name: 'state', value: 'missing', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T14:00:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.r).toBe('r1');
    });

    it('passes when report is stale but references a healthy non-missing artifact', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'r1' as OcelId, type: 'report' as OcelTypeName,
            attributes: [{ name: 'updatedAt', value: '2026-05-24T10:00:00Z', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: [{ objectId: 'a1' as OcelId, qualifier: 'references' as Qualifier }]
          },
          {
            id: 'a1' as OcelId, type: 'artifact' as OcelTypeName,
            attributes: [{ name: 'state', value: 'active', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T14:00:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });

    it('passes when report is not stale (<= 2 hours old) even if it references a missing artifact', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'r1' as OcelId, type: 'report' as OcelTypeName,
            attributes: [{ name: 'updatedAt', value: '2026-05-24T13:00:00Z', time: '2026-05-24T13:00:00Z' as ISODateTime }],
            relationships: [{ objectId: 'a1' as OcelId, qualifier: 'references' as Qualifier }]
          },
          {
            id: 'a1' as OcelId, type: 'artifact' as OcelTypeName,
            attributes: [{ name: 'state', value: 'missing', time: '2026-05-24T13:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T14:00:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 6. c-queue-starvation tests
  describe('c-queue-starvation', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-queue-starvation')!;

    it('violates when a mailbox message is available for more than 10 minutes', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [
              { name: 'state', value: 'available', time: '2026-05-24T10:00:00Z' as ISODateTime },
              { name: 'availableAt', value: '2026-05-24T10:00:00Z', time: '2026-05-24T10:00:00Z' as ISODateTime }
            ],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T10:15:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.m).toBe('m1');
    });

    it('passes when a mailbox message is available for less than or equal to 10 minutes', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [
              { name: 'state', value: 'available', time: '2026-05-24T10:08:00Z' as ISODateTime },
              { name: 'availableAt', value: '2026-05-24T10:08:00Z', time: '2026-05-24T10:08:00Z' as ISODateTime }
            ],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T10:15:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });

    it('passes when a mailbox message was available long ago but is now executing or confirmed', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName,
            attributes: [
              { name: 'state', value: 'confirmed', time: '2026-05-24T10:12:00Z' as ISODateTime },
              { name: 'availableAt', value: '2026-05-24T10:00:00Z', time: '2026-05-24T10:00:00Z' as ISODateTime }
            ],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2026-05-24T10:15:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 7. c-completion-accounting tests
  describe('c-completion-accounting', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-completion-accounting')!;

    it('violates when completion is claimed but an accounting domain is failed', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'ad1' as OcelId, type: 'accounting_domain' as OcelTypeName,
            attributes: [{ name: 'state', value: 'failed', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'completion_claim' as OcelTypeName, time: '2026-05-24T10:05:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.cc).toBe('e1');
    });

    it('passes when completion is claimed and accounting domain is healthy (conserved)', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          {
            id: 'ad1' as OcelId, type: 'accounting_domain' as OcelTypeName,
            attributes: [{ name: 'state', value: 'conserved', time: '2026-05-24T10:00:00Z' as ISODateTime }],
            relationships: []
          }
        ],
        events: [
          { id: 'e1' as OcelId, type: 'completion_claim' as OcelTypeName, time: '2026-05-24T10:05:00Z' as ISODateTime, attributes: [], relationships: [] }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 8. c-proof-after-failure tests
  describe('c-proof-after-failure', () => {
    const c = PROJECT_CONSTRAINTS.find(x => x.id === 'c-proof-after-failure')!;

    it('violates when proof succeeds after failure without intervening file change', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: [
          {
            id: 'e1' as OcelId, type: 'proof_failed' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime,
            attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'target' as Qualifier }]
          },
          {
            id: 'e2' as OcelId, type: 'proof_succeeded' as OcelTypeName, time: '2026-05-24T10:05:00Z' as ISODateTime,
            attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'target' as Qualifier }]
          }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(1);
      expect(v[0].variablesBound.f).toBe('f1');
    });

    it('passes when proof succeeds after failure with intervening file change', () => {
      const log: OcelV2Log = {
        objectTypes: [], eventTypes: [],
        objects: [
          { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
        ],
        events: [
          {
            id: 'e1' as OcelId, type: 'proof_failed' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime,
            attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'target' as Qualifier }]
          },
          {
            id: 'e2' as OcelId, type: 'file_changed' as OcelTypeName, time: '2026-05-24T10:03:00Z' as ISODateTime,
            attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }]
          },
          {
            id: 'e3' as OcelId, type: 'proof_succeeded' as OcelTypeName, time: '2026-05-24T10:05:00Z' as ISODateTime,
            attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'target' as Qualifier }]
          }
        ]
      };
      const v = evaluateProjectConstraint(c, log);
      expect(v.length).toBe(0);
    });
  });

  // 9. Predicate & Query validation tests
  describe('Unsupported & Malformed Query/Predicate Refusal', () => {
    const dummyLog: OcelV2Log = { objectTypes: [], eventTypes: [], objects: [], events: [] };

    it('refuses unsupported logical predicate kinds (implies)', () => {
      expect(() => evaluatePredicate({
        kind: 'implies' as any,
        predicates: []
      }, {}, dummyLog)).toThrowError(/Unsupported predicate kind: implies/);
    });

    it('refuses unknown predicate kinds', () => {
      expect(() => evaluatePredicate({
        kind: 'weird_kind' as any
      }, {}, dummyLog)).toThrowError(/Unknown predicate kind: weird_kind/);
    });

    it('refuses malformed predicate missing kind', () => {
      expect(() => evaluatePredicate({} as any, {}, dummyLog)).toThrowError(/Malformed predicate/);
    });

    it('refuses unsupported attribute operators (lt)', () => {
      expect(() => evaluatePredicate({
        kind: 'attribute',
        variable: 'v',
        attribute: 'a',
        op: 'lt',
        value: 10
      }, {}, dummyLog)).toThrowError(/Unsupported attribute comparison operator: lt/);
    });

    it('refuses unknown attribute operators', () => {
      expect(() => evaluatePredicate({
        kind: 'attribute',
        variable: 'v',
        attribute: 'a',
        op: 'is_funny' as any,
        value: 10
      }, {}, dummyLog)).toThrowError(/Unknown attribute comparison operator: is_funny/);
    });

    it('refuses malformed attribute predicate missing variable', () => {
      expect(() => evaluatePredicate({
        kind: 'attribute',
        attribute: 'a',
        op: 'eq',
        value: 10
      } as any, {}, dummyLog)).toThrowError(/Malformed predicate/);
    });

    it('refuses malformed relationship predicate missing toVariable', () => {
      expect(() => evaluatePredicate({
        kind: 'relationship',
        fromVariable: 'x'
      } as any, {}, dummyLog)).toThrowError(/Malformed predicate/);
    });

    it('refuses unsupported temporal operators (within)', () => {
      expect(() => evaluatePredicate({
        kind: 'temporal',
        leftEventVariable: 'e1',
        rightEventVariable: 'e2',
        op: 'within'
      }, {}, dummyLog)).toThrowError(/Unsupported temporal operator: within/);
    });

    it('refuses unknown temporal operators', () => {
      expect(() => evaluatePredicate({
        kind: 'temporal',
        leftEventVariable: 'e1',
        rightEventVariable: 'e2',
        op: 'sometime_today' as any
      }, {}, dummyLog)).toThrowError(/Unknown temporal operator: sometime_today/);
    });

    it('refuses malformed temporal predicate missing leftEventVariable', () => {
      expect(() => evaluatePredicate({
        kind: 'temporal',
        rightEventVariable: 'e2',
        op: 'before'
      } as any, {}, dummyLog)).toThrowError(/Malformed predicate/);
    });

    it('refuses malformed nested query missing quantifier', () => {
      const badConstraint: OcpqConstraint = {
        id: 'c-bad',
        name: 'bad name',
        description: 'bad desc',
        severity: 'error',
        violationQuery: {
          id: 'q-bad',
          label: 'bad label',
          variables: [],
          predicates: [],
          children: [],
          quantifier: undefined as any
        }
      };
      expect(() => evaluateProjectConstraint(badConstraint, dummyLog)).toThrowError(/Malformed nested query/);
    });

    it('refuses malformed nested query variables missing kind', () => {
      const badConstraint: OcpqConstraint = {
        id: 'c-bad',
        name: 'bad name',
        description: 'bad desc',
        severity: 'error',
        violationQuery: {
          id: 'q-bad',
          label: 'bad label',
          variables: [{ id: 'v1', kind: undefined as any }],
          predicates: [],
          children: [],
          quantifier: 'exists'
        }
      };
      expect(() => evaluateProjectConstraint(badConstraint, dummyLog)).toThrowError(/Malformed nested query/);
    });

    it('refuses recursively when child query has unsupported predicate', () => {
      const badConstraint: OcpqConstraint = {
        id: 'c-bad',
        name: 'bad name',
        description: 'bad desc',
        severity: 'error',
        violationQuery: {
          id: 'q-root',
          label: 'root',
          variables: [],
          predicates: [],
          quantifier: 'exists',
          children: [
            {
              id: 'q-child',
              label: 'child',
              variables: [],
              quantifier: 'exists',
              children: [],
              predicates: [
                {
                  kind: 'attribute',
                  variable: 'x',
                  attribute: 'y',
                  op: 'contains' // Unsupported operator
                }
              ]
            }
          ]
        }
      };
      expect(() => evaluateProjectConstraint(badConstraint, dummyLog)).toThrowError(/Unsupported attribute comparison operator: contains/);
    });
  });

  // 10. Accounting conservation test
  it('conserves total constraints in evaluateProjectConstraintsAll', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [],
      objects: [
        { id: 'cp1' as OcelId, type: 'gall_checkpoint' as OcelTypeName, attributes: [], relationships: [] },
        { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
      ],
      events: [
        { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2026-05-24T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] }
      ]
    };

    const badConstraint: OcpqConstraint = {
      id: 'c-bad',
      name: 'bad name',
      description: 'bad desc',
      severity: 'error',
      violationQuery: {
        id: 'q-bad',
        label: 'bad label',
        variables: [],
        predicates: [],
        children: [{} as any],
        quantifier: 'exists'
      }
    };
    const all = [...PROJECT_CONSTRAINTS, badConstraint];

    const report = evaluateProjectConstraintsAll(log, all);
    const { attempted, passed, violated, refused, failed } = report.accounting;

    expect(attempted).toBe(passed + violated + refused + failed);
    expect(attempted).toBe(9);
    expect(violated).toBeGreaterThan(0);
    expect(refused).toBe(1);
    expect(passed).toBeGreaterThan(0);
    expect(failed).toBe(0);
  });
});
