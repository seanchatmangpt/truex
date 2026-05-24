import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

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

function verifyReceipt(targetPath) {
  const fullPath = resolve(process.cwd(), targetPath)
  if (!existsSync(fullPath)) {
    console.error(`❌ [IO Refusal] File not found: ${fullPath}`)
    return
  }

  console.log(`[Truex Verifier] Reading envelope from: ${fullPath}`)

  let envelope
  try {
    envelope = JSON.parse(readFileSync(fullPath, 'utf8'))
  } catch (error_) {
    console.error(`❌ [IO Refusal] Refused to parse JSON: ${error_.message}`)
    return
  }

  const { session_id, expected_path_hash, ocel2_batch_hash, receipt_hash, ocel2, admission_status } = envelope

  // Step 1: Recompute OCEL 2.0 Canonical Batch Hash
  const canonicalOcel2 = canonicalStringify(ocel2)
  const computedBatchHash = createHash('sha256').update(canonicalOcel2).digest('hex')

  const batchValid = computedBatchHash === ocel2_batch_hash
  console.log('\n  [Batch Check]')
  console.log(`    Expected: ${ocel2_batch_hash}`)
  console.log(`    Computed: ${computedBatchHash}`)
  console.log(`    Result:   ${batchValid ? '✅ MATCH' : '❌ MISMATCH'}`)

  // Step 2: Recompute Receipt Admission Signature
  const receiptSeed = `${session_id}:${computedBatchHash}:${expected_path_hash}`
  const computedReceiptHash = createHash('sha256').update(receiptSeed).digest('hex')

  const receiptValid = computedReceiptHash === receipt_hash
  console.log('\n  [Receipt Signature Check]')
  console.log(`    Expected: ${receipt_hash}`)
  console.log(`    Computed: ${computedReceiptHash}`)
  console.log(`    Result:   ${receiptValid ? '✅ MATCH' : '❌ MISMATCH'}`)

  console.log('\n' + '='.repeat(55))
  if (batchValid && receiptValid) {
    console.log(' ✅ RECEIPT VERIFIED')
    console.log(`    Status: ${admission_status}`)
    console.log('='.repeat(55) + '\n')
  } else {
    console.log(' ❌ RECEIPT FORGED (INTEGRITY COMPROMISED)')
    console.log('='.repeat(55) + '\n')
  }
}

// Verification runs
console.log('Verifying Generated Truex Receipts...')
verifyReceipt('examples/out/truex_ocel2_valid.json')
verifyReceipt('examples/out/truex_ocel2_fraudulent.json')
