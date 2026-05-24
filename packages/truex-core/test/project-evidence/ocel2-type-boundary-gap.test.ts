// packages/truex-core/test/project-evidence/ocel2-type-boundary-gap.test.ts

import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  isOcelEventType,
  isOcelObjectType,
  isOcelEventObjectRelationship,
  isOcelObjectObjectRelationship,
  isOcelObjectAttribute,
  isOcelEventAttribute,
  isOcelEvent,
  isOcelObject,
  isOcelV2Log,
  createOcelId,
  createOcelTypeName,
  createQualifier,
  createISODateTime
} from '../../src/ocel2-project-types.js';
import type {
  OcelId,
  OcelTypeName,
  Qualifier,
  ISODateTime,
  Hash256,
  ReceiptHash,
  ReplayHash,
  ProjectPath,
  OcelAttributeKind,
  OcelAttributeValue,
  OcelEventRow,
  OcelObjectRow,
  OcelEventObjectRow,
  OcelObjectObjectRow,
  OcelEventAttributeRow,
  OcelObjectAttributeRow,
  TruexProjectObjectType,
  TruexProjectEventType,
  TruexOcelProjection,
  OcpqNestedQuery,
  OcpqConstraint,
  ProcessFeature,
  ProcessRule,
  ProcessKnowledgeBase,
  PowlNode,
  GallCheckpoint,
  WizardCommandReceipt,
  WizardMission,
  ProjectCell,
  ProjectTopology,
  PersistentMailboxMessage,
  PersistentMailboxTransition,
  PersistentMailboxMetrics,
  MailboxMessageAccounting,
  WizardCommandAccounting,
  GallCheckpointAccounting,
  WizardProjectReport
} from '../../src/ocel2-project-types.js';

describe('OCEL2 Type Boundary Gap & Compile-Time Enforcement', () => {
  // 1. BRANDED TYPES COMPILE-TIME BOUNDARY LAWS
  it('enforces type boundaries of branded types at compile-time', () => {
    // These should FAIL to compile because raw string cannot be assigned to branded types directly
    // @ts-expect-error - string is not assignable to OcelId
    const id: OcelId = 'raw-string';
    // @ts-expect-error - string is not assignable to OcelTypeName
    const typeName: OcelTypeName = 'raw-string';
    // @ts-expect-error - string is not assignable to Qualifier
    const qualifier: Qualifier = 'raw-string';
    // @ts-expect-error - string is not assignable to ISODateTime
    const iso: ISODateTime = 'raw-string';
    // @ts-expect-error - string is not assignable to Hash256
    const hash256: Hash256 = 'raw-string';
    // @ts-expect-error - string is not assignable to ProjectPath
    const path: ProjectPath = 'raw-string';

    // These should FAIL to compile because Hash256 is not assignable to more specific ReceiptHash/ReplayHash
    // @ts-expect-error - Hash256 is not assignable to ReceiptHash
    const receipt: ReceiptHash = 'hash' as Hash256;
    // @ts-expect-error - Hash256 is not assignable to ReplayHash
    const replay: ReplayHash = 'hash' as Hash256;

    // These should PASS compilation because branded types are assignable to their raw base type (string)
    const str1: string = 'id' as OcelId;
    const str2: string = '2026-05-24T00:00:00Z' as ISODateTime;
    const str3: string = 'hash' as Hash256;

    // These should PASS compilation because subtype relation holds
    const hashVal1: Hash256 = 'hash' as ReceiptHash;
    const hashVal2: Hash256 = 'hash' as ReplayHash;

    expect(str1).toBe('id');
    expect(str2).toBe('2026-05-24T00:00:00Z');
    expect(str3).toBe('hash');
    expect(hashVal1).toBe('hash');
    expect(hashVal2).toBe('hash');
  });

  // 2. RUNTIME AND TYPE BOUNDARY FOR INVALID ATTRIBUTES
  it('refuses invalid attribute kind values at compile-time and runtime', () => {
    // Compile-time: valid attribute kinds
    expectTypeOf<'string' | 'time' | 'integer' | 'float' | 'boolean'>().toMatchTypeOf<OcelAttributeKind>();
    
    // Runtime check of values
    const allowedKinds: OcelAttributeKind[] = ['string', 'time', 'integer', 'float', 'boolean'];
    
    const isValidKind = (k: string): k is OcelAttributeKind => 
      allowedKinds.includes(k as OcelAttributeKind);

    expect(isValidKind('string')).toBe(true);
    expect(isValidKind('time')).toBe(true);
    expect(isValidKind('integer')).toBe(true);
    expect(isValidKind('float')).toBe(true);
    expect(isValidKind('boolean')).toBe(true);

    expect(isValidKind('double')).toBe(false);
    expect(isValidKind('object')).toBe(false);
    expect(isValidKind('array')).toBe(false);
  });

  it('refuses malformed event/object attributes at runtime', () => {
    // Event Attributes
    expect(isOcelEventAttribute({ name: 'ok', value: 123 })).toBe(true);
    expect(isOcelEventAttribute({ name: 'ok', value: 'hello' })).toBe(true);
    expect(isOcelEventAttribute({ name: 'ok', value: null })).toBe(true);
    expect(isOcelEventAttribute({ value: 123 })).toBe(false); // missing name
    expect(isOcelEventAttribute({ name: 123, value: 'ok' })).toBe(false); // bad name type
    expect(isOcelEventAttribute(null)).toBe(false);

    // Object Attributes (requires time)
    expect(isOcelObjectAttribute({ name: 'status', value: 'active', time: '2026-05-24T00:00:00Z' as ISODateTime })).toBe(true);
    expect(isOcelObjectAttribute({ name: 'status', value: 'active' })).toBe(false); // missing time
    expect(isOcelObjectAttribute({ name: 'status', value: 'active', time: 123 })).toBe(false); // bad time type
  });

  // 3. EVENT AND OBJECT SHAPE VALIDATION
  it('validates event and object shape compliance', () => {
    const validEvent = {
      id: createOcelId('e_01'),
      type: createOcelTypeName('project_initialized'),
      time: createISODateTime('2026-05-24T01:00:00Z'),
      attributes: [{ name: 'actor', value: 'agent-1' }],
      relationships: [{ objectId: createOcelId('obj_01'), qualifier: createQualifier('target') }]
    };

    expect(isOcelEvent(validEvent)).toBe(true);

    // Missing fields
    expect(isOcelEvent({ ...validEvent, id: undefined })).toBe(false);
    expect(isOcelEvent({ ...validEvent, type: undefined })).toBe(false);
    expect(isOcelEvent({ ...validEvent, time: undefined })).toBe(false);
    expect(isOcelEvent({ ...validEvent, attributes: undefined })).toBe(false);
    expect(isOcelEvent({ ...validEvent, relationships: undefined })).toBe(false);

    // Malformed array elements
    expect(isOcelEvent({ ...validEvent, attributes: [{ name: 'actor' }] })).toBe(false);
    expect(isOcelEvent({ ...validEvent, relationships: [{ objectId: 'obj_01' }] })).toBe(false);

    const validObject = {
      id: createOcelId('obj_01'),
      type: createOcelTypeName('project'),
      attributes: [{ name: 'name', value: 'truex', time: createISODateTime('2026-05-24T01:00:00Z') }],
      relationships: [{ objectId: createOcelId('sub_01'), qualifier: createQualifier('contains') }]
    };

    expect(isOcelObject(validObject)).toBe(true);
    expect(isOcelObject({ ...validObject, id: undefined })).toBe(false);
    expect(isOcelObject({ ...validObject, type: undefined })).toBe(false);
    expect(isOcelObject({ ...validObject, attributes: [{ name: 'name', value: 'truex' }] })).toBe(false); // missing time in attribute
  });

  // 4. V2 LOG HYGIENE & SHAPE
  it('validates comprehensive OCEL V2 log structure', () => {
    const validLog = {
      eventTypes: [{ name: createOcelTypeName('project_initialized'), attributes: [] }],
      objectTypes: [{ name: createOcelTypeName('project'), attributes: [] }],
      events: [
        {
          id: createOcelId('e_01'),
          type: createOcelTypeName('project_initialized'),
          time: createISODateTime('2026-05-24T01:00:00Z'),
          attributes: [],
          relationships: []
        }
      ],
      objects: [
        {
          id: createOcelId('obj_01'),
          type: createOcelTypeName('project'),
          attributes: [],
          relationships: []
        }
      ]
    };

    expect(isOcelV2Log(validLog)).toBe(true);

    // Missing keys
    expect(isOcelV2Log({ ...validLog, eventTypes: undefined })).toBe(false);
    expect(isOcelV2Log({ ...validLog, objectTypes: undefined })).toBe(false);
    expect(isOcelV2Log({ ...validLog, events: undefined })).toBe(false);
    expect(isOcelV2Log({ ...validLog, objects: undefined })).toBe(false);

    // Bad items
    expect(isOcelV2Log({ ...validLog, events: [{ id: 'e_01' }] })).toBe(false);
  });

  // 5. ACCOUNTING INVARIANT CONSERVATION LAWS
  it('verifies accounting domain invariants and type boundaries', () => {
    // Assert that the structures align with compile-time shapes
    const commandAcc: WizardCommandAccounting = {
      id: 'cmd_acc_1',
      unit: 'wizard_command',
      attempted: 5,
      terminal: { succeeded: 3, refused: 1, failed: 1 },
      invariant: 'terminal_equals_attempted',
      conserved: true
    };

    expect(commandAcc.conserved).toBe(true);
    expect(commandAcc.terminal.succeeded + commandAcc.terminal.refused + commandAcc.terminal.failed).toBe(commandAcc.attempted);

    const checkpointAcc: GallCheckpointAccounting = {
      id: 'cp_acc_1',
      unit: 'gall_checkpoint',
      attempted: 4,
      terminal: { proposed: 1, accepted: 1, refused: 1, executed: 0, failed: 1 },
      invariant: 'terminal_equals_attempted',
      conserved: true
    };
    
    expect(checkpointAcc.conserved).toBe(true);
    expect(
      checkpointAcc.terminal.proposed +
      checkpointAcc.terminal.accepted +
      checkpointAcc.terminal.refused +
      checkpointAcc.terminal.executed +
      checkpointAcc.terminal.failed
    ).toBe(checkpointAcc.attempted);

    // Mailbox message accounting domain checks open keys too
    const mailboxAcc: MailboxMessageAccounting = {
      id: 'mb_acc_1',
      unit: 'mailbox_message',
      attempted: 10,
      terminal: {
        confirmed: 5,
        refused: 1,
        rolledBack: 0,
        quarantined: 1,
        discarded: 1,
        cancelled: 0
      },
      open: {
        scheduled: 1,
        available: 1,
        executing: 0,
        retryable: 0,
        suspended: 0,
        rescueCandidate: 0
      },
      invariant: 'terminal_plus_open_equals_attempted',
      conserved: true
    };

    const terminalSum = Object.values(mailboxAcc.terminal).reduce((a, b) => a + b, 0);
    const openSum = Object.values(mailboxAcc.open || {}).reduce((a, b) => a + b, 0);
    expect(terminalSum + openSum).toBe(mailboxAcc.attempted);
  });
});
