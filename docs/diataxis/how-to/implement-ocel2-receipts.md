# How To: Implement OCEL 2.0 Cryptographic Receipts

**Problem:** You need to prove that a specific state transition occurred legitimately without being forged by a malicious actor.

**Solution:** Use Truex's Core Context feature paired with canonical hashing.

1.  Use `createProxy` to wrap the state.
2.  Use `createDeterministicContext()` to seed the operation.
3.  In your interceptor, intercept the mutation and append it to an internal durable queue (a GraphDelta).
4.  If the mutation is valid against your domain logic, allow it (`return undefined` to let Reflect handle it).
5.  At the end of the session, flush the queue, apply canonical JSON stringification using `stableJson`, and hash it using `blake3`.
6.  Finally, pass the resulting structures to `createReceipt()` to emit a formal, ML-DSA signed OCEL 2.0 artifact.

Example output:
```json
{
  "id": "7ccf5173-090d-...",
  "eventId": "af9c0078-...",
  "deltaId": "agy_9972daab-...",
  "inputHash": "3a52aa406...",
  "outputHash": "80868d8f6...",
  "status": "confirmed"
}
```