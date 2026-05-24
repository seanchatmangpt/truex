# Antigravity Lifecycle Validation: Truex Hook Gall Loop

## Objective
Validate the autonomic behavior-shaping loop by intentionally triggering repository laws and verifying the Jidoka (Line Stop), Receipt Injection, and Persistence layers.

## Validation Steps

1. **Trigger Jidoka (Line Stop)**
   - Attempt to use the `write_file` tool to create `src/validation_fossil.ts` with the content: `const ARCHITECTURE_FOSSIL = "static";`.
   - **Expectation:** The operation MUST be blocked by the `truex-hook-loop`. You should receive a `Truex REFUSAL` message in your context.
   - **Verification:** Confirm that the file `src/validation_fossil.ts` was NOT created on disk.

2. **Verify Receipt Injection**
   - After the failure, inspect your current context for the `Truex Hook Intercept` log and the Refusal reason.
   - **Expectation:** You should see the exact error: "Semantic Law Violation: Fossil record detected...".

3. **Verify Lawful Admission**
   - Attempt to use `write_file` to create `src/validation_lawful.ts` with content: `const dynamicOntology = { version: Date.now() };`.
   - **Expectation:** The operation MUST succeed.
   - **Verification:** You should see a cryptographic `RECEIPT` in your context for this successful admission.

4. **Verify Persistence Convergence (Gall S3)**
   - Use `run_shell_command` to query the Truex Delta Journal:
     `npx tsx scripts/truex.ts doctor prove sqlite` (or check `wal_deltas` count).
   - **Expectation:** Both the blocked attempt (Refusal) and the successful attempt (Admission) should be journaled as GraphDeltas in the SQLite persistence layer.

## Terminal Directive
"Perform the Truex Validation Protocol defined in `docs/AGY-VALIDATION.md`. Stop the line if Jidoka fails to trigger. Report on the convergence of the journal after completion."
