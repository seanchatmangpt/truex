import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { createProxy, createContext } from '../src/index.js'

// --- CANONICAL HASHING ---
// Strictly follows Truex Canonicalization & Receipt Profile v1
function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const clone = [...obj]
      if (clone[0]['ocel:id']) {
        clone.sort((a, b) => (a['ocel:id'] > b['ocel:id'] ? 1 : -1))
      } else if (clone[0]['ocel:event-id'] && clone[0]['ocel:object-id']) {
        clone.sort((a, b) => {
          const keyA = `${a['ocel:event-id']}|${a['ocel:object-id']}|${a['ocel:qualifier']}`
          const keyB = `${b['ocel:event-id']}|${b['ocel:object-id']}|${b['ocel:qualifier']}`
          return keyA > keyB ? 1 : -1
        })
      } else if (clone[0]['ocel:object-id'] && clone[0]['ocel:field']) {
        clone.sort((a, b) => {
          const keyA = `${a['ocel:object-id']}|${a['ocel:timestamp'] || a['ocel:time']}|${a['ocel:field']}`
          const keyB = `${b['ocel:object-id']}|${b['ocel:timestamp'] || b['ocel:time']}|${b['ocel:field']}`
          return keyA > keyB ? 1 : -1
        })
      }
      return `[${clone.map(canonicalStringify).join(',')}]`
    }
    return `[${obj.map(canonicalStringify).join(',')}]`
  }

  const keys = Object.keys(obj).sort()
  return `{${keys.map(k => `"${k}":${canonicalStringify(obj[k])}`).join(',')}}`
}

// --- DURABLE QUEUE (FILE BACKED) ---
class DurableQueue {
  constructor(filepath) {
    this.filepath = filepath
    if (!existsSync(filepath)) {
      writeFileSync(filepath, JSON.stringify({ events: [], objectChanges: [], eventObjectRels: [] }))
    }
  }

  push(evt, changes, rels) {
    const data = JSON.parse(readFileSync(this.filepath, 'utf8'))
    data.events.push(evt)
    data.objectChanges.push(...changes)
    data.eventObjectRels.push(...rels)
    writeFileSync(this.filepath, JSON.stringify(data))
  }

  flush() {
    const data = JSON.parse(readFileSync(this.filepath, 'utf8'))
    writeFileSync(this.filepath, JSON.stringify({ events: [], objectChanges: [], eventObjectRels: [] }))
    return data
  }
}

// --- EXPECTED VS OBSERVED ADMISSION ---
const EXPECTED_PATH = ['idle', 'cart_updated', 'address_added', 'processing', 'paid']
const EXPECTED_PATH_HASH = createHash('sha256').update(EXPECTED_PATH.join('->')).digest('hex')

// --- TRUEX CAPTURE SYSTEM ---
class TruexCapture {
  constructor(queuePath) {
    this.queue = new DurableQueue(queuePath)
    this.ocel2State = {
      eventTypes: {
        Mutation: { attributes: ['causality', 'actor'] },
        ReceiptDecision: { attributes: ['decision', 'reason'] }
      },
      objectTypes: {
        User: { attributes: ['role'] },
        Order: { attributes: ['currency'] },
        Session: { attributes: ['platform'] },
        Receipt: { attributes: ['hash'] }
      },
      events: [],
      objects: [],
      'event-object': [],
      'object-object': [],
      objectChanges: []
    }

    // Register Global Objects
    this.ocel2State.objects.push({ 'ocel:id': 'USER_442', 'ocel:type': 'User', 'ocel:attributes': { role: 'Customer' } })
    this.ocel2State.objects.push({ 'ocel:id': 'APP_SESSION_991', 'ocel:type': 'Session', 'ocel:attributes': { platform: 'iOS' } })
    this.ocel2State.objects.push({ 'ocel:id': 'ORD_8841', 'ocel:type': 'Order', 'ocel:attributes': { currency: 'USD' } })
  }

  getContextWrapper(initialState) {
    const causalityContext = createContext()
    const { proxy: state, defineSetInterceptor } = createProxy(initialState)
    let currentObservedIdx = 0

    defineSetInterceptor((target, prop, newValue) => {
      const oldValue = target[prop]
      if (oldValue === newValue) return true

      const currentAction = causalityContext.tryUse() || 'Background Sync'
      const timestamp = new Date().toISOString()
      const evtId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

      // 1. Admission Control: Validate Checkout Transition
      switch (prop) {
      case 'checkoutStatus': {
        const expectedNext = EXPECTED_PATH[currentObservedIdx + 1]
        if (newValue !== expectedNext) {
          // RECEIPT REFUSED
          console.error(`\n❌ [ReceiptRefused] Illegal transition: ${oldValue} -> ${newValue}. Expected: ${expectedNext}`)
          this.emitRefusalEvent(evtId, timestamp, oldValue, newValue, currentAction)
          return true // Block mutation but satisfy strict-mode Membrane traps
        }
        currentObservedIdx++
      
      break;
      }
      case 'cartTotal': {
        currentObservedIdx = EXPECTED_PATH.indexOf('cart_updated')
      
      break;
      }
      case 'shippingAddress': {
        currentObservedIdx = EXPECTED_PATH.indexOf('address_added')
      
      break;
      }
      // No default
      }

      // 2. Build Event
      const evt = {
        'ocel:id': evtId,
        'ocel:type': 'Mutation',
        'ocel:timestamp': timestamp,
        'ocel:attributes': { causality: currentAction, actor: 'USER_442' }
      }

      // 3. Object Changes
      const changes = [
        { 'ocel:object-id': 'ORD_8841', 'ocel:time': timestamp, 'ocel:field': String(prop), 'ocel:value': newValue }
      ]

      // 4. Qualified Relationships
      const rels = [
        { 'ocel:event-id': evtId, 'ocel:object-id': 'USER_442', 'ocel:qualifier': 'initiated' },
        { 'ocel:event-id': evtId, 'ocel:object-id': 'ORD_8841', 'ocel:qualifier': 'mutated' },
        { 'ocel:event-id': evtId, 'ocel:object-id': 'APP_SESSION_991', 'ocel:qualifier': 'context' }
      ]

      this.queue.push(evt, changes, rels)
      target[prop] = newValue
      console.log(`  [Admitted] ${String(prop)}: ${oldValue} -> ${newValue}`)
      return true
    })

    return { state, causalityContext }
  }

  emitRefusalEvent(evtId, timestamp, oldVal, newVal, action) {
    const evt = {
      'ocel:id': `${evtId}_refusal`,
      'ocel:type': 'ReceiptDecision',
      'ocel:timestamp': timestamp,
      'ocel:attributes': { decision: 'refused', reason: `illegal transition ${oldVal} -> ${newVal}` }
    }
    const rels = [
      { 'ocel:event-id': `${evtId}_refusal`, 'ocel:object-id': 'ORD_8841', 'ocel:qualifier': 'refused_mutation' },
      { 'ocel:event-id': `${evtId}_refusal`, 'ocel:object-id': 'USER_442', 'ocel:qualifier': 'initiated' }
    ]
    this.queue.push(evt, [], rels)
  }

  async egress(sessionId, deviceId, runName) {
    console.log(`\n[Truex Egress: ${runName}] Draining durable local queue...`)
    const batch = this.queue.flush()
    if (batch.events.length === 0) return

    this.ocel2State.events = batch.events
    this.ocel2State.objectChanges = batch.objectChanges
    this.ocel2State['event-object'] = batch.eventObjectRels

    const hasRefusal = batch.events.some(e => e['ocel:type'] === 'ReceiptDecision')

    // Canonical Hashing
    const serializedBatch = canonicalStringify(this.ocel2State)
    const ocel2BatchHash = createHash('sha256').update(serializedBatch).digest('hex')
    const receiptSeed = `${sessionId}:${ocel2BatchHash}:${EXPECTED_PATH_HASH}`
    const receiptHash = createHash('sha256').update(receiptSeed).digest('hex')

    const traceId = createHash('md5').update(Date.now().toString()).digest('hex')
    const spanId = traceId.slice(0, 16)

    const payload = {
      truex_profile: 'truex.ocel2.receipt.v1',
      trace_id: traceId,
      span_id: spanId,
      session_id: sessionId,
      device_id: deviceId,
      admission_status: hasRefusal ? 'ReceiptRefused' : 'ReceiptAdmitted',
      expected_path_hash: EXPECTED_PATH_HASH,
      ocel2_batch_hash: ocel2BatchHash,
      receipt_hash: receiptHash,
      ocel2: this.ocel2State
    }

    const outDir = resolve(process.cwd(), 'examples/out')
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true })
    }

    writeFileSync(resolve(outDir, `truex_ocel2_${runName}.json`), JSON.stringify(payload, null, 2))
    console.log(`[Success] Truex Envelope generated: truex_ocel2_${runName}.json`)
  }
}

// --- EXECUTION ---
async function runCaptureDemo() {
  const outDir = resolve(process.cwd(), 'examples/out')
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }
  const queuePath = resolve(outDir, 'local_db.json')
  if (existsSync(queuePath)) {
    rmSync(queuePath)
  }

  // RUN A: The Happy Path
  console.log('\n' + '='.repeat(55))
  console.log(' RUN A: Valid Checkout Path')
  console.log('='.repeat(55))
  const captureA = new TruexCapture(queuePath)
  const { state: stateA, causalityContext: ctxA } = captureA.getContextWrapper({ checkoutStatus: 'idle', cartTotal: 0, shippingAddress: null })

  ctxA.call('User tapped \'Add to Cart\'', () => { stateA.cartTotal = 150 })
  ctxA.call('User entered Shipping Address', () => { stateA.shippingAddress = '123 Truex Lane' })
  ctxA.call('User tapped \'Checkout\'', () => { stateA.checkoutStatus = 'processing' })
  ctxA.call('Webhook: Payment Success', () => { stateA.checkoutStatus = 'paid' })

  await captureA.egress('APP_SESSION_991', 'DEVICE_A22', 'valid')

  // RUN B: The Fraudulent Path
  console.log('\n' + '='.repeat(55))
  console.log(' RUN B: Fake/Invalid Checkout Closure')
  console.log('='.repeat(55))
  if (existsSync(queuePath)) {
    rmSync(queuePath)
  }
  const captureB = new TruexCapture(queuePath)
  const { state: stateB, causalityContext: ctxB } = captureB.getContextWrapper({ checkoutStatus: 'idle', cartTotal: 0, shippingAddress: null })

  ctxB.call('User tapped \'Add to Cart\'', () => { stateB.cartTotal = 150 })
  // Missing address added & missing processing! Attempt to jump straight to paid
  ctxB.call('Hacked API call', () => { stateB.checkoutStatus = 'paid' })

  await captureB.egress('APP_SESSION_991', 'DEVICE_A22', 'fraudulent')
}

runCaptureDemo().catch(console.error)
