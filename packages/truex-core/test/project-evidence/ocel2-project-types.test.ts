import { describe, it, expect } from 'vitest';
import {
  OcelId,
  OcelTypeName,
  Qualifier,
  ISODateTime,
  OcelEvent,
  OcelObject,
  OcelV2Log,
  OcelEventRow
} from '../../src/ocel2-project-types.js';

describe('OCEL v2 / OCED Type Surface (Agent 1)', () => {
  it('should compile branded types and check simple shape validators', () => {
    // 1. Valid event
    const event: OcelEvent = {
      id: 'e1' as OcelId,
      type: 'project_initialized' as OcelTypeName,
      time: '2026-05-24T00:00:00Z' as ISODateTime,
      attributes: [{ name: 'mission', value: 'Test' }],
      relationships: [{ objectId: 'obj1' as OcelId, qualifier: 'created_by' as Qualifier }]
    };

    expect(event.id).toBe('e1');
    expect(event.relationships[0].qualifier).toBe('created_by');

    // 2. Valid object
    const obj: OcelObject = {
      id: 'obj1' as OcelId,
      type: 'project' as OcelTypeName,
      attributes: [{ name: 'root', value: '/tmp', time: '2026-05-24T00:00:00Z' as ISODateTime }],
      relationships: [{ objectId: 'obj2' as OcelId, qualifier: 'depends_on' as Qualifier }]
    };

    expect(obj.id).toBe('obj1');
    expect(obj.attributes[0].time).toBe('2026-05-24T00:00:00Z');

    // 3. SQLite row types compilation check
    const row: OcelEventRow = {
      ocel_id: 'e1' as OcelId,
      ocel_type: 'project_initialized' as OcelTypeName,
      ocel_time: '2026-05-24T00:00:00Z' as ISODateTime
    };
    expect(row.ocel_id).toBe('e1');
  });

  it('should validate shapes at runtime using runtime checks', () => {
    const isOcelEvent = (e: any): e is OcelEvent => {
      return (
        e &&
        typeof e.id === 'string' &&
        typeof e.type === 'string' &&
        typeof e.time === 'string' &&
        Array.isArray(e.attributes) &&
        Array.isArray(e.relationships)
      );
    };

    const validEvent = {
      id: 'evt1',
      type: 'test_evt',
      time: '2026-05-24T00:00:00Z',
      attributes: [],
      relationships: []
    };

    const invalidEvent = {
      type: 'test_evt',
      time: '2026-05-24T00:00:00Z',
      attributes: [],
      relationships: []
    };

    expect(isOcelEvent(validEvent)).toBe(true);
    expect(isOcelEvent(invalidEvent)).toBe(false);
  });
});
