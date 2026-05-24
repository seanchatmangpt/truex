import { createProxy } from '../src/proxy/create-proxy.js'
import {
  createReplayContext,
  registerReplayInterceptors,
} from '../src/replay/replay-context.js'
import {
  createTransactionContext,
  registerTransactionInterceptors,
} from '../src/transactions/transaction-context.js'
import {
  createCapabilityContext,
  registerCapabilityInterceptors,
} from '../src/security/capability-acl.js'

console.log('=== Deterministic Replay & Time Travel Example ===\n')

// Example 1: Basic Recording and Replay
console.log('1. Basic Recording and Replay')
console.log('------------------------------')
const user = { name: 'Alice', age: 25, role: 'developer' }
const userMembrane = createProxy(user)
const userReplay = createReplayContext(user)

registerReplayInterceptors(userMembrane, userReplay)

// Record a sequence of operations
const recording1 = userReplay.record(() => {
  console.log('  Recording operations...')
  userMembrane.proxy.name = 'Bob'
  userMembrane.proxy.age = 30
  const _role = userMembrane.proxy.role
  console.log(`  User is now: ${userMembrane.proxy.name}, ${userMembrane.proxy.age} years old`)
})

console.log(`  Recording ID: ${recording1}`)
const rec1 = userReplay.getRecording(recording1)
const setOps = rec1.invocations.filter((inv) => inv.trap === 'set')
console.log(`  Recorded ${setOps.length} set operations\n`)

// Replay the recording
console.log('  Replaying operations...')
const replayResult1 = userReplay.replay(recording1)
console.log(`  Replay conserved in ${replayResult1.duration}ms`)
console.log(`  Replayed ${replayResult1.replayedInvocations.length} total invocations\n`)

// Example 2: Multiple Recordings and Time Travel
console.log('2. Multiple Recordings - Time Travel')
console.log('-------------------------------------')
const state = { counter: 0, history: [] }
const stateMembrane = createProxy(state)
const stateReplay = createReplayContext(state)

registerReplayInterceptors(stateMembrane, stateReplay)

// Record multiple points in time
const snapshot1 = stateReplay.record(() => {
  stateMembrane.proxy.counter = 10
  console.log(`  Snapshot 1: counter = ${stateMembrane.proxy.counter}`)
})

const _snapshot2 = stateReplay.record(() => {
  stateMembrane.proxy.counter = 20
  console.log(`  Snapshot 2: counter = ${stateMembrane.proxy.counter}`)
})

const snapshot3 = stateReplay.record(() => {
  stateMembrane.proxy.counter = 30
  console.log(`  Snapshot 3: counter = ${stateMembrane.proxy.counter}`)
})

console.log(`  Current counter: ${state.counter}`)
console.log(`  Total recordings: ${stateReplay.getRecordingIds().length}`)

// Time travel - replay any snapshot
console.log('  Time traveling to snapshot 1...')
stateReplay.replay(snapshot1)
console.log('  Time traveling to snapshot 3...')
stateReplay.replay(snapshot3)
console.log()

// Example 3: Replay with Transactions
console.log('3. Replay with Transactions')
console.log('---------------------------')
const account = { balance: 1000, transactions: [] }
const accountMembrane = createProxy(account)
const accountReplay = createReplayContext(account)
const accountTx = createTransactionContext(account)

registerReplayInterceptors(accountMembrane, accountReplay)
registerTransactionInterceptors(accountMembrane, accountTx)

const transactionRec = accountReplay.record(() => {
  console.log(`  Initial balance: $${accountMembrane.proxy.balance}`)

  accountTx.call(() => {
    console.log('  Starting transaction: withdrawing $500')
    accountMembrane.proxy.balance = accountMembrane.proxy.balance - 500
    console.log(`  New balance: $${accountMembrane.proxy.balance}`)
  })

  // Simulate refusal - rollback
  console.log('  Transaction refused! Rolling back...')
  accountTx.rollback()
  console.log(`  Balance after rollback: $${account.balance}`)
})

const txRec = accountReplay.getRecording(transactionRec)
const txSetOps = txRec.invocations.filter((inv) => inv.trap === 'set')
console.log(`  Recorded ${txSetOps.length} operations during transaction\n`)

// Example 4: Replay with Access Control
console.log('4. Replay with Access Control')
console.log('------------------------------')
const document = { title: 'Secret', content: 'Classified', author: 'Alice' }
const docMembrane = createProxy(document)
const docReplay = createReplayContext(document)
const docCapability = createCapabilityContext(document, {
  canRead: new Set(['title', 'author']), // Can only read title and author, not content
  canWrite: new Set(['author']), // Can only write to author
})

registerReplayInterceptors(docMembrane, docCapability)
registerCapabilityInterceptors(docMembrane, docCapability)

const aclRec = docReplay.record(() => {
  docCapability.call(() => {
    console.log('  Reading with limited access...')
    try {
      const _title = docMembrane.proxy.title
      console.log('  ✓ Successfully read title')
    } catch {
      console.log('  ✗ Refused to read title')
    }

    try {
      const _content = docMembrane.proxy.content // Should refuse
      console.log('  ✓ Successfully read content')
    } catch {
      console.log('  ✗ Access denied for content (as expected)')
    }

    try {
      docMembrane.proxy.author = 'Bob'
      console.log('  ✓ Successfully updated author')
    } catch {
      console.log('  ✗ Refused to update author')
    }
  })
})

const aclRecording = docReplay.getRecording(aclRec)
const getOps = aclRecording.invocations.filter((inv) => inv.trap === 'get')
console.log(`  Recorded ${getOps.length} get operations\n`)

// Example 5: Deterministic Replay
console.log('5. Deterministic Replay')
console.log('-----------------------')
const game = { score: 0, level: 1 }
const gameMembrane = createProxy(game)
const gameReplay = createReplayContext(game)

registerReplayInterceptors(gameMembrane, gameReplay)

const gameplayRec = gameReplay.record(() => {
  gameMembrane.proxy.score = 100
  gameMembrane.proxy.level = 2
  gameMembrane.proxy.score = 250
})

console.log('  Replaying gameplay 3 times...')
const replay1 = gameReplay.replay(gameplayRec)
const replay2 = gameReplay.replay(gameplayRec)
const replay3 = gameReplay.replay(gameplayRec)

const allEqual =
  replay1.replayedInvocations.length === replay2.replayedInvocations.length &&
  replay2.replayedInvocations.length === replay3.replayedInvocations.length

console.log(`  All replays have same number of operations: ${allEqual}`)
console.log(`  Replay is deterministic: ${allEqual ? '✓' : '✗'}\n`)

// Example 6: Recording Management
console.log('6. Recording Management')
console.log('-----------------------')
const dataMembrane = createProxy({ value: 0 })
const dataReplay = createReplayContext({ value: 0 })

registerReplayInterceptors(dataMembrane, dataReplay)

// Create multiple recordings
const _recA = dataReplay.record(() => {
  dataMembrane.proxy.value = 1
})
const recB = dataReplay.record(() => {
  dataMembrane.proxy.value = 2
})
const _recC = dataReplay.record(() => {
  dataMembrane.proxy.value = 3
})

console.log(`  Created ${dataReplay.getRecordingIds().length} recordings`)

// Clear specific recording
dataReplay.clearRecording(recB)
console.log(`  After clearing recB: ${dataReplay.getRecordingIds().length} recordings remain`)

// Clear all recordings
dataReplay.clearRecording()
console.log(`  After clearing all: ${dataReplay.getRecordingIds().length} recordings remain\n`)

console.log('=== All examples conserved! ===')
