import { describe, it, expect } from 'vitest';
import {
  evaluateProjectConstraint,
  evaluateProjectConstraintsAll,
  PROJECT_CONSTRAINTS,
  evaluatePredicate
} from '../../src/ocpq-project-constraints.gall.js';
import type { OcelV2Log, OcelId, OcelTypeName, ISODateTime, Qualifier } from '../../src/ocel2-project-types.js';

describe('OCPQ Constraint Gap Coverage', () => {
  it('changed file without later proof is violation', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
      ], events: [
        { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2023-01-01T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] }
      ]
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.f).toBe('f1');
  });

  it('changed file with later proof passes', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] }
      ], events: [
        { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2023-01-01T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] },
        { id: 'e2' as OcelId, type: 'proof_succeeded' as OcelTypeName, time: '2023-01-01T10:05:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'proved' as Qualifier }] }
      ]
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-proof-command-missing')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(0);
  });

  it('checkpoint without accounting domain is violation', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'cp1' as OcelId, type: 'gall_checkpoint' as OcelTypeName, attributes: [], relationships: [] }
      ], events: []
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-checkpoint-accounting')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.cp).toBe('cp1');
  });

  it('handoff before 12-hour gate is violation', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [], events: [
        { id: 'e1' as OcelId, type: 'project_initialized' as OcelTypeName, time: '2023-01-01T10:00:00Z' as ISODateTime, attributes: [], relationships: [] },
        { id: 'e2' as OcelId, type: 'handoff_completed' as OcelTypeName, time: '2023-01-01T15:00:00Z' as ISODateTime, attributes: [], relationships: [] }
      ]
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-handoff-timing')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.e).toBe('e2');
  });

  it('terminal mailbox state without receipt is violation', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'm1' as OcelId, type: 'mailbox_message' as OcelTypeName, attributes: [{ name: 'state', value: 'confirmed', time: '1970' as ISODateTime }], relationships: [] }
      ], events: []
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-mailbox-receipt-missing')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.m).toBe('m1');
  });

  it('stale report missing artifact is violation', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'r1' as OcelId, type: 'report' as OcelTypeName, attributes: [{ name: 'updatedAt', value: '2023-01-01T10:00:00Z', time: '1970' as ISODateTime }], relationships: [{ objectId: 'a1' as OcelId, qualifier: 'references' as Qualifier }] },
        { id: 'a1' as OcelId, type: 'artifact' as OcelTypeName, attributes: [{ name: 'state', value: 'missing', time: '1970' as ISODateTime }], relationships: [] }
      ], events: [
        { id: 'e1' as OcelId, type: 'dummy' as OcelTypeName, time: '2023-01-01T15:00:00Z' as ISODateTime, attributes: [], relationships: [] }
      ]
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-stale-report')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.r).toBe('r1');
  });

  it('failed accounting blocks completion claim', () => {
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'ad1' as OcelId, type: 'accounting_domain' as OcelTypeName, attributes: [{ name: 'state', value: 'failed', time: '1970' as ISODateTime }], relationships: [] }
      ], events: [
        { id: 'cc1' as OcelId, type: 'completion_claim' as OcelTypeName, time: '2023-01-01T10:00:00Z' as ISODateTime, attributes: [], relationships: [] }
      ]
    };
    const c = PROJECT_CONSTRAINTS.find(c => c.id === 'c-completion-accounting')!;
    const v = evaluateProjectConstraint(c, log);
    expect(v.length).toBe(1);
    expect(v[0].variablesBound.cc).toBe('cc1');
  });

  it('unsupported predicate kind refuses', () => {
    expect(() => evaluatePredicate({ kind: 'and' as any, predicates: [] } as any, {}, {} as any)).toThrowError(/Unsupported predicate kind/);
  });

  it('malformed nested query refuses', () => {
    const log: OcelV2Log = { objectTypes: [], eventTypes: [], objects: [], events: [] };
    const badConstraint = { ...PROJECT_CONSTRAINTS[0], violationQuery: { ...PROJECT_CONSTRAINTS[0].violationQuery!, children: [{} as any] } };
    expect(() => evaluateProjectConstraint(badConstraint, log)).toThrowError(/Malformed nested query/);
  });

  it('constraint accounting conserves', () => {
    // We pass a log that causes exactly some passes and some violations
    const log: OcelV2Log = {
      objectTypes: [], eventTypes: [], objects: [
        { id: 'cp1' as OcelId, type: 'gall_checkpoint' as OcelTypeName, attributes: [], relationships: [] }, // violation for checkpoint accounting
        { id: 'f1' as OcelId, type: 'source_file' as OcelTypeName, attributes: [], relationships: [] } // changed file violation
      ], events: [
        { id: 'e1' as OcelId, type: 'file_changed' as OcelTypeName, time: '2023-01-01T10:00:00Z' as ISODateTime, attributes: [], relationships: [{ objectId: 'f1' as OcelId, qualifier: 'changed' as Qualifier }] }
      ]
    };

    // add a malformed constraint to trigger refused
    const badConstraint = { ...PROJECT_CONSTRAINTS[0], id: 'c-bad', violationQuery: { ...PROJECT_CONSTRAINTS[0].violationQuery!, children: [{} as any] } };
    const all = [...PROJECT_CONSTRAINTS, badConstraint];

    const report = evaluateProjectConstraintsAll(log, all);
    const { attempted, passed, violated, refused, failed } = report.accounting;
    
    // total must conserve
    expect(attempted).toBe(passed + violated + refused + failed);
    expect(attempted).toBe(9);
    expect(violated).toBeGreaterThan(0);
    expect(refused).toBe(1);
    expect(passed).toBeGreaterThan(0);
  });
});
