import { describe, it, expect } from 'vitest'
import { OcelCollector, createOcelProxy, canonicalStringify } from '../../src/ocel2/index.js'

describe('OCEL 2.0 Membrane', () => {
  it('should capture proxy mutations into OCEL format within an event', () => {
    const ocel = new OcelCollector()

    const target = { name: 'Zoe Church', volunteerCount: 0 }
    const church = createOcelProxy(target, { type: 'Church', id: 'church_1' }, ocel)

    // Mutations outside an event are ignored by the collector
    church.name = 'Zoe Global'
    expect(ocel.export().objectChanges.length).toBe(0)

    // Mutations inside an event are captured
    ocel.event({
      activity: 'UpdateChurch',
      actor: 'admin_1',
      objects: [{ id: 'church_1', type: 'Church', qualifier: 'target' }]
    }, () => {
      church.volunteerCount = 10
    })

    const exported = ocel.export()
    
    // Check Event was created
    expect(exported.events.length).toBe(1)
    expect(exported.events[0]['ocel:type']).toBe('UpdateChurch')
    expect(exported.events[0]['ocel:attributes'].actor).toBe('admin_1')

    // Check Object registered
    expect(exported.objects.length).toBe(1)
    expect(exported.objects[0]['ocel:id']).toBe('church_1')
    expect(exported.objects[0]['ocel:type']).toBe('Church')

    // Check Event-Object relation
    expect(exported['event-object'].length).toBe(1)
    expect(exported['event-object'][0]['ocel:object-id']).toBe('church_1')
    expect(exported['event-object'][0]['ocel:qualifier']).toBe('target')

    // Check Object Change
    expect(exported.objectChanges.length).toBe(1)
    expect(exported.objectChanges[0]['ocel:object-id']).toBe('church_1')
    expect(exported.objectChanges[0]['ocel:field']).toBe('volunteerCount')
    expect(exported.objectChanges[0]['ocel:value']).toBe(10)
  })

  it('should support speculative simulation and branching', async () => {
    const ocel = new OcelCollector()
    
    const target = { status: 'idle' }
    const service = createOcelProxy(target, { type: 'Service', id: 'service_1' }, ocel)

    // Run a simulation
    const simulation = await ocel.simulate({
      activity: 'TestRun',
    }, () => {
      service.status = 'running'
    })

    // Real object is unchanged
    expect(target.status).toBe('idle')
    expect(service.status).toBe('idle')

    // Original OCEL is unchanged
    expect(ocel.export().events.length).toBe(0)
    expect(ocel.export().objectChanges.length).toBe(0)

    // Speculative OCEL has the event and changes
    expect(simulation.speculativeOcel.events.length).toBe(1)
    expect(simulation.speculativeOcel.objectChanges.length).toBe(1)
    expect(simulation.speculativeOcel.objectChanges[0]['ocel:value']).toBe('running')

    // Settle the simulation
    simulation.settle()

    // Now real object is changed
    expect(target.status).toBe('running')
    
    // And base OCEL contains the branch
    expect(ocel.export().events.length).toBe(1)
    expect(ocel.export().objectChanges[0]['ocel:value']).toBe('running')
  })

  it('should generate a Truex envelope with receipts', () => {
    const ocel = new OcelCollector()
    const target = { count: 0 }
    const proxy = createOcelProxy(target, { type: 'Counter', id: 'counter_1' }, ocel)

    ocel.event({ activity: 'Increment' }, () => {
      proxy.count++
    })

    const envelope = ocel.exportEnvelope('trace_99', 'span_99')

    expect(envelope.profile).toBe('zoe.ocel2.v1')
    expect(envelope.traceId).toBe('trace_99')
    expect(envelope.ocelBatchHash).toBeTypeOf('string')
    expect(envelope.receiptHash).toBeTypeOf('string')
    expect(envelope.ocel.events.length).toBe(1)
  })

  it('should deterministically canonicalize OCEL JSON', () => {
    const obj1 = { b: 2, a: { z: 1, y: 2 } }
    const obj2 = { a: { y: 2, z: 1 }, b: 2 }

    expect(canonicalStringify(obj1)).toBe(canonicalStringify(obj2))
  })
})
