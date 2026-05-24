import { describe, it, expect } from 'vitest';
import {
  evaluateProjectConstraint,
  evaluatePredicate,
  PROJECT_CONSTRAINTS
} from '../../src/ocpq-project-constraints.gall.js';
import type { OcelV2Log, OcelId, OcelTypeName, ISODateTime, OcpqPredicate } from '../../src/ocel2-project-types.js';

describe('OCPQ Project Constraints', () => {

  it('should detect a missing proof violation when a source file has no proof command event', () => {
    const log: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [],
      objects: [
        {
          id: 'file_index.ts' as OcelId,
          type: 'source_file' as OcelTypeName,
          attributes: [],
          relationships: []
        }
      ]
    };

    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
    const violations = evaluateProjectConstraint(constraint, log);

    expect(violations.length).toBe(1);
    expect(violations[0].constraintId).toBe('c-proof-command-missing');
    expect(violations[0].variablesBound.f).toBe('file_index.ts');
  });

  it('should verify correct proof command relation resolves the violation', () => {
    const log: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [
        {
          id: 'evt_proof' as OcelId,
          type: 'proof_succeeded' as OcelTypeName,
          time: '2026-05-24T00:00:00Z' as ISODateTime,
          attributes: [],
          relationships: [
            { objectId: 'file_index.ts' as OcelId, qualifier: 'proved_by' as any }
          ]
        }
      ],
      objects: [
        {
          id: 'file_index.ts' as OcelId,
          type: 'source_file' as OcelTypeName,
          attributes: [],
          relationships: []
        }
      ]
    };

    const constraint = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
    const violations = evaluateProjectConstraint(constraint, log);
    expect(violations.length).toBe(0);
  });

  it('should evaluate supported predicate structures and reject unsupported ones', () => {
    const log: OcelV2Log = {
      eventTypes: [],
      objectTypes: [],
      events: [],
      objects: []
    };

    const p: OcpqPredicate = {
      kind: 'attribute',
      variable: 'x',
      attribute: 'val',
      op: 'eq',
      value: 10
    };

    const binding = {
      x: { val: 10 }
    };

    expect(evaluatePredicate(p, binding, log)).toBe(true);

    const unsupportedPredicate: OcpqPredicate = {
      kind: 'temporal',
      leftEventVariable: 'e1',
      op: 'within', // unsupported op
      rightEventVariable: 'e2'
    };

    expect(() => evaluatePredicate(unsupportedPredicate, { e1: { time: '2026-05-24T00:00:00Z' }, e2: { time: '2026-05-24T00:00:05Z' } }, log)).toThrow('Unsupported temporal operator: within');

    const unsupportedKindPredicate: OcpqPredicate = {
      kind: 'implies' as any,
      predicates: []
    };
    expect(() => evaluatePredicate(unsupportedKindPredicate, {}, log)).toThrow('Unsupported predicate kind: implies');
  });
});
