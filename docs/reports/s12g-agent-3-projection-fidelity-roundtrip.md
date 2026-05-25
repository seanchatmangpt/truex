# S12G Agent 3: Projection Fidelity + Round-Trip Verification Report

## 1. Executive Summary

This report establishes complete operational trust in the OCEL 2.0 projection mechanics of the **TRUEX** engine. By enforcing strict event-object connectivity and validating that all terminal events link to cryptographic receipt objects, we guarantee that the manufacturing history of the system is fully verifiable. 

Furthermore, we demonstrate **lossless round-trip reconstruction**, proving that the raw domain primitives (Project details, status, checkpoints, mailbox messages, queues) can be fully restored from the projected OCEL 2.0 log without information loss.

---

## 2. Invariant: Strict Event-Object Connectivity

To prevent orphan event logs that do not relate to any physical or system entity, we have hardened the integrity validator (`validateOcelIntegrity`) to enforce that **every event must connect to at least one object**.

```typescript
export function validateOcelIntegrity(log: OcelV2Log): void {
  const objectIds = new Set(log.objects.map(o => o.id));
  for (const event of log.events) {
    if (event.relationships.length === 0) {
      throw new Error(`Integrity Error: Event ${event.id} of type ${event.type} has no relationships to objects`);
    }
    // ...
  }
}
```

### Verified Mappings
- **Wizard Commands**: Links to the `wizard_command` object (`qualifier: 'changed'`).
- **Proof Commands**: Links to both the `proof_cmd` object (`qualifier: 'proved_by'`) and the `report` object (`qualifier: 'reported_in'`).
- **Checkpoint Proposals / Acceptances**: Links to the corresponding `gall_checkpoint` object.
- **Handoff Terminals**: Links to the `report` object (`qualifier: 'reported_in'`), the `project` object (`qualifier: 'changed'`), and the cryptographic `receipt` object (`qualifier: 'emitted'`).
- **Mailbox Messages**:
  - `mailbox_enqueued`: Links to the message object (`qualifier: 'emitted'`).
  - `mailbox_confirmed` / `mailbox_refused` / `mailbox_quarantined`: Links to the message object, the queue, and the emitted receipt.

---

## 3. Invariant: Terminal Events Link to Receipts

A terminal event in TRUEX represents an irreversible state transition. To prevent unauthorized or unreceipted state mutations, **every terminal event must link to a valid receipt object**.

### Mapped Terminal Events & Receipts
| Terminal Event Type | Emitted Receipt Type | Qualifier |
| :--- | :--- | :--- |
| `handoff_completed` | `receipt` | `emitted` |
| `handoff_refused` | `receipt` | `emitted` |
| `proof_succeeded` | `receipt` | `emitted` |
| `proof_failed` | `receipt` | `emitted` |
| `mailbox_confirmed` | `receipt` | `emitted` |
| `mailbox_refused` | `receipt` | `emitted` |
| `mailbox_quarantined` | `receipt` | `emitted` |
| `replay_converged` | `receipt` | `emitted` |
| `replay_diverged` | `receipt` | `emitted` |

If any of these events are generated without a corresponding `receipt_` object reference, the `validateOcelIntegrity` execution immediately halts the flow with an `Integrity Error`.

---

## 4. Lossless Round-Trip Reconstruction

We have successfully implemented and executed round-trip verification tests proving that the original domain primitives can be fully reconstructed from the projected OCEL 2.0 log:

1. **Project Report Reconstruction**:
   - The original project root is recovered from the `project` object attributes.
   - The final handoff status and report hash are verified against the cryptographic `receipt` object.
   - All proposed checkpoints (`name`, `purpose`) are reconstructed from the `gall_checkpoint` objects.
2. **Operational Mailbox Reconstruction**:
   - The queue name and final state (`confirmed`, `refused`, `quarantined`) are reconstructed from the `mailbox_message` attributes.
   - The corresponding execution receipts are verified to match their original hash attributes.

---

## 5. Test Evidence & CLI Validation

All projection, constraint, and round-trip verification tests have been executed and pass successfully.

```bash
npx vitest run packages/membrane/test/project-evidence/
```

### Execution Output:
```text
 Test Files  10 passed (10)
      Tests  85 passed (85)
   Start at  01:47:35
   Duration  2.21s (transform 706ms, setup 0ms, import 1.10s, tests 75ms, environment 1ms)
```

Additionally, running the Doctor CLI prove command verifies the entire pipeline:
```bash
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove project-evidence-gapclose
```
```text
🩺 Doctor running proof for primitive: "project-evidence-gapclose"...
🚀 Starting Object-Centric Project Evidence Gap Discovery & Repair (S12G) verification...
📄 Report written to /Users/sac/truex/docs/vision2030/project-evidence-gapclose-proof.report.json
✅ Primitive "project-evidence-gapclose" proven successfully.
```

---

## 6. Alignment with Repository Laws

- **Gall Law**: We did not introduce speculative architectures. All projection types are derived directly from working primitives.
- **Testing Law**: Both valid/complete projections and tampered/broken projections (such as events with zero relationships or missing receipts) were tested, proving that invalid states fail cleanly.
- **Receipt Law**: Re-enforces that receipts are the ultimate source of truth, and no terminal event can exist without one.
