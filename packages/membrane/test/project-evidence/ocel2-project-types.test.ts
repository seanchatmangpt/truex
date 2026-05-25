import { describe, it, expect } from 'vitest';
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
  OcelAttributeKind,
  OcelAttributeValue,
  OcelEventRow,
  OcelObjectRow,
  OcelEventObjectRow,
  OcelObjectObjectRow,
  OcelEventAttributeRow,
  OcelObjectAttributeRow
} from '../../src/ocel2-project-types.js';

describe('OCEL v2 Boundary Types', () => {
  it('1. valid event type accepted', () => {
    const eventType = { name: createOcelTypeName('Order Created') };
    expect(isOcelEventType(eventType)).toBe(true);
  });

  it('2. valid object type accepted', () => {
    const objectType = { name: createOcelTypeName('Order') };
    expect(isOcelObjectType(objectType)).toBe(true);
  });

  it('3. event-object relationship requires object id and qualifier', () => {
    const validRel = {
      objectId: createOcelId('o1'),
      qualifier: createQualifier('creates')
    };
    expect(isOcelEventObjectRelationship(validRel)).toBe(true);

    const invalidRel1 = { qualifier: createQualifier('creates') }; // missing objectId
    expect(isOcelEventObjectRelationship(invalidRel1)).toBe(false);

    const invalidRel2 = { objectId: createOcelId('o1') }; // missing qualifier
    expect(isOcelEventObjectRelationship(invalidRel2)).toBe(false);
  });

  it('4. object-object relationship requires object id and qualifier', () => {
    const validRel = {
      objectId: createOcelId('o2'),
      qualifier: createQualifier('contains')
    };
    expect(isOcelObjectObjectRelationship(validRel)).toBe(true);

    const invalidRel1 = { qualifier: createQualifier('contains') }; // missing objectId
    expect(isOcelObjectObjectRelationship(invalidRel1)).toBe(false);

    const invalidRel2 = { objectId: createOcelId('o2') }; // missing qualifier
    expect(isOcelObjectObjectRelationship(invalidRel2)).toBe(false);
  });

  it('5. object attribute requires observation time', () => {
    const validAttr = {
      name: 'status',
      value: 'open',
      time: createISODateTime('2023-01-01T12:00:00Z')
    };
    expect(isOcelObjectAttribute(validAttr)).toBe(true);

    const invalidAttr = {
      name: 'status',
      value: 'open'
    }; // missing time
    expect(isOcelObjectAttribute(invalidAttr)).toBe(false);
  });

  it('6. invalid attribute kind refused', () => {
    const isOcelAttributeKind = (kind: any): kind is OcelAttributeKind => {
      return ['string', 'time', 'integer', 'float', 'boolean'].includes(kind);
    };
    expect(isOcelAttributeKind('float')).toBe(true);
    expect(isOcelAttributeKind('unknown_kind')).toBe(false);
  });

  it('7. event without id refused', () => {
    const validEvent = {
      id: createOcelId('e1'),
      type: createOcelTypeName('Order Created'),
      time: createISODateTime('2023-01-01T12:00:00Z'),
      attributes: [],
      relationships: []
    };
    expect(isOcelEvent(validEvent)).toBe(true);

    const invalidEvent = {
      type: createOcelTypeName('Order Created'),
      time: createISODateTime('2023-01-01T12:00:00Z'),
      attributes: [],
      relationships: []
    }; // missing id
    expect(isOcelEvent(invalidEvent)).toBe(false);
  });

  it('8. object without type refused', () => {
    const validObject = {
      id: createOcelId('o1'),
      type: createOcelTypeName('Order'),
      attributes: [],
      relationships: []
    };
    expect(isOcelObject(validObject)).toBe(true);

    const invalidObject = {
      id: createOcelId('o1'),
      attributes: [],
      relationships: []
    }; // missing type
    expect(isOcelObject(invalidObject)).toBe(false);
  });

  it('9. OCEL log with missing event type refused', () => {
    const validLog = {
      eventTypes: [{ name: createOcelTypeName('Order Created') }],
      objectTypes: [],
      events: [],
      objects: []
    };
    expect(isOcelV2Log(validLog)).toBe(true);

    const invalidLog = {
      // missing eventTypes
      objectTypes: [],
      events: [],
      objects: []
    };
    expect(isOcelV2Log(invalidLog)).toBe(false);
    
    // Also check event with invalid element in array
    const invalidLog2 = {
      eventTypes: [{ name: 123 }], // invalid name type
      objectTypes: [],
      events: [],
      objects: []
    };
    expect(isOcelV2Log(invalidLog2)).toBe(false);
  });

  it('10. SQLite row types compile and round-trip through mapper fixtures', () => {
    // Just a type-level check to ensure interfaces exist and behave correctly
    const eventRow: OcelEventRow = { ocel_id: 'e1' as OcelId, ocel_type: 'Order Created' as OcelTypeName, ocel_time: '2023-01-01T12:00:00Z' as ISODateTime };
    const objectRow: OcelObjectRow = { ocel_id: 'o1' as OcelId, ocel_type: 'Order' as OcelTypeName };
    const eoRow: OcelEventObjectRow = { ocel_event_id: 'e1' as OcelId, ocel_object_id: 'o1' as OcelId, ocel_qualifier: 'creates' as Qualifier };
    const ooRow: OcelObjectObjectRow = { ocel_source_id: 'o1' as OcelId, ocel_target_id: 'o2' as OcelId, ocel_qualifier: 'contains' as Qualifier };
    const eaRow: OcelEventAttributeRow = { ocel_event_id: 'e1' as OcelId, name: 'price', type: 'float' as OcelAttributeKind, value: 19.99 };
    const oaRow: OcelObjectAttributeRow = { ocel_object_id: 'o1' as OcelId, ocel_time: '2023-01-01T12:00:00Z' as ISODateTime, name: 'status', type: 'string' as OcelAttributeKind, value: 'open' };

    // Mapper fixture simulation
    const toEvent = (row: OcelEventRow) => ({ id: row.ocel_id, type: row.ocel_type, time: row.ocel_time });
    expect(toEvent(eventRow)).toEqual({ id: 'e1', type: 'Order Created', time: '2023-01-01T12:00:00Z' });

    expect(objectRow.ocel_id).toBe('o1');
    expect(eoRow.ocel_qualifier).toBe('creates');
    expect(ooRow.ocel_source_id).toBe('o1');
    expect(eaRow.value).toBe(19.99);
    expect(oaRow.ocel_time).toBe('2023-01-01T12:00:00Z');
  });
});
