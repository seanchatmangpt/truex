# OTP Scope Mapping Findings

This document traces the implementation of the 15 OTP concepts across the `membrane` codebase:
- [context.ts](file:///Users/sac/truex/packages/membrane/src/context.ts)
- [hook.ts](file:///Users/sac/truex/packages/membrane/src/hook.ts)
- [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts)

---

## 1. Actor/Process Identity

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L6-L58)
*   **Class/Function/Type Name:** `HookProcessId` (type), `HookProcess` (interface), `createHookProcess` (function)
*   **Line Range:** L6, L33-42, L44-58
*   **Source Quote / Implementation:**
    ```typescript
    export type HookProcessId = string;

    export interface HookProcess {
      id: string;
      behavior: (state: any, msg: any) => { nextState: any; effects: any[] };
      state: any;
      mailbox: HookMailbox;
      restartCount: number;
      isHalted: boolean;
      supervisorId?: string;
      lastReceiptHash: string | null;
    }
    ```
    And:
    ```typescript
    export function createHookProcess(
      id: string,
      behavior: (state: any, msg: any) => { nextState: any; effects: any[] },
      initialState: any = {}
    ): HookProcess {
      return {
        id,
        behavior,
        state: JSON.parse(JSON.stringify(initialState)),
        mailbox: createHookMailbox(),
        restartCount: 0,
        isHalted: false,
        lastReceiptHash: null
      };
    }
    ```

---

## 2. Mailbox

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L14-L31)
*   **Class/Function/Type Name:** `HookMailbox` (interface), `createHookMailbox` (function)
*   **Line Range:** L14-20, L22-31
*   **Source Quote / Implementation:**
    ```typescript
    export interface HookMailbox {
      queue: HookMessage[];
      push(msg: HookMessage): void;
      pop(): HookMessage | undefined;
      isEmpty(): boolean;
      size(): number;
    }

    export function createHookMailbox(): HookMailbox {
      const queue: HookMessage[] = [];
      return {
        queue,
        push: (msg) => queue.push(msg),
        pop: () => queue.shift(),
        isEmpty: () => queue.length === 0,
        size: () => queue.length
      };
    }
    ```

---

## 3. FIFO Ordering

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L26-L27)
*   **Class/Function/Type Name:** `createHookMailbox` (function)
*   **Line Range:** L26-27 (within `createHookMailbox`), L194-201 (within `dispatchMessage`)
*   **Source Quote / Implementation:**
    ```typescript
    push: (msg) => queue.push(msg),
    pop: () => queue.shift(),
    ```
    *Paraphrase:* Messages are enqueued at the back of the queue array using standard JavaScript array `.push()` and retrieved from the front using `.shift()`, guaranteeing First-In, First-Out execution ordering.

---

## 4. Message Dispatch

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L118-L301)
*   **Class/Function/Type Name:** `dispatchMessage` (function)
*   **Line Range:** L118-301
*   **Source Quote / Implementation:**
    ```typescript
    export function dispatchMessage(
      runtime: HookOtpRuntime,
      msg: HookMessage
    ): { allowed: boolean; reason?: string; receipt: Receipt } {
    ```
    *Paraphrase:* The dispatcher checks process existence/halted status, validates the input delta structure, performs capacity breach assertions, queues/dequeues messages in a FIFO fashion, executes the process's callback behavior, builds signed receipts, catches and logs execution errors, and invokes supervision/quarantining logic when needed.

---

## 5. Isolated Process State

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L51-L52)
*   **Class/Function/Type Name:** `createHookProcess` and `dispatchMessage` (functions)
*   **Line Range:** L51-52 (during process creation), L207-213 (during message execution)
*   **Source Quote / Implementation:**
    Inside `createHookProcess`:
    ```typescript
    state: JSON.parse(JSON.stringify(initialState)),
    ```
    Inside `dispatchMessage`:
    ```typescript
    // Save state before processing for receipt input hash and possible supervisor rollback
    const stateBefore = JSON.parse(JSON.stringify(proc.state));

    // Execute behavior
    const { nextState, effects } = proc.behavior(stateBefore, currentMsg);

    // Verify nextState and effects are valid
    proc.state = nextState;
    ```
    *Paraphrase:* Process state isolation is enforced by deep cloning (`JSON.parse(JSON.stringify(...))`) the initial state during process creation and immediately before executing the behavior. This protects the internal state from side effects during execution and supports state rollback on failures.

---

## 6. Supervisor

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L60-L79)
*   **Class/Function/Type Name:** `HookSupervisor` (interface), `createHookSupervisor` (function), supervision logic block in `dispatchMessage`
*   **Line Range:** L60-79 (interface and creation), L248-287 (supervision block in `dispatchMessage`)
*   **Source Quote / Implementation:**
    ```typescript
    export interface HookSupervisor {
      id: string;
      policy: { maxRestarts: number; withinMs: number };
      processes: Map<string, HookProcess>;
      initialStates: Map<string, any>;
      restartTimestamps: Map<string, number[]>;
    }
    ```
    And:
    ```typescript
    export function createHookSupervisor(
      id: string,
      policy: { maxRestarts: number; withinMs: number }
    ): HookSupervisor {
      return {
        id,
        policy,
        processes: new Map(),
        initialStates: new Map(),
        restartTimestamps: new Map()
      };
    }
    ```
    *Paraphrase:* A supervisor maintains a map of monitored processes, initial state mappings for rollback, and historical crash/restart timestamps to decide whether to restart or halt crashed processes according to its policy.

---

## 7. Restart Policy

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L62)
*   **Class/Function/Type Name:** `HookSupervisor` (interface), `dispatchMessage` (function)
*   **Line Range:** L62 (policy type), L251-255 (policy check)
*   **Source Quote / Implementation:**
    Policy Type definition:
    ```typescript
    policy: { maxRestarts: number; withinMs: number };
    ```
    Policy enforcement:
    ```typescript
    const supervisor = proc.supervisorId ? runtime.supervisors.get(proc.supervisorId) : undefined;
    const now = Date.now();

    if (supervisor) {
      const history = supervisor.restartTimestamps.get(proc.id) || [];
      const recent = history.filter(t => now - t <= supervisor.policy.withinMs);

      if (recent.length >= supervisor.policy.maxRestarts) {
    ```

---

## 8. Restart Budget

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L255-L287)
*   **Class/Function/Type Name:** `dispatchMessage` (function)
*   **Line Range:** L255-287
*   **Source Quote / Implementation:**
    ```typescript
      if (recent.length >= supervisor.policy.maxRestarts) {
        // Budget exhausted -> halt process
        proc.isHalted = true;
        // Quarantine the message
        runtime.quarantine.push({
          processId: proc.id,
          message: currentMsg,
          error: `Budget exhausted: ${errorMsg}`,
          timestamp: now
        });
        runtime.refusedReceipts.push(refusedReceipt);
        return { allowed: false, reason: "Process halted: restart budget exhausted", receipt: refusedReceipt };
      } else {
        // Budget not exhausted -> restart/rollback state and increment restart count
        recent.push(now);
        supervisor.restartTimestamps.set(proc.id, recent);
        proc.restartCount++;
        runtime.metrics.restarts++;

        // Rollback process state to initial state
        const initState = supervisor.initialStates.get(proc.id);
        proc.state = initState !== undefined ? JSON.parse(JSON.stringify(initState)) : {};
        ...
    ```

---

## 9. Poison Message Quarantine

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L81-L86)
*   **Class/Function/Type Name:** `HookQuarantineRecord` (interface), `dispatchMessage` (function)
*   **Line Range:** L81-86, L258-264, L278-284, L291-296
*   **Source Quote / Implementation:**
    ```typescript
    export interface HookQuarantineRecord {
      processId: HookProcessId;
      message: HookMessage;
      error: string;
      timestamp: number;
    }
    ```
    *Paraphrase:* Whenever a process crashes while executing behavior, the error-inducing message is permanently removed from the mailbox and logged into the `runtime.quarantine` map along with error details and a timestamp (preventing subsequent retry loops on the same faulty input).

---

## 10. Crash Containment

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L205-L300)
*   **Class/Function/Type Name:** `dispatchMessage` (function)
*   **Line Range:** L205-300
*   **Source Quote / Implementation:**
    ```typescript
    try {
      // Save state before processing for receipt input hash and possible supervisor rollback
      const stateBefore = JSON.parse(JSON.stringify(proc.state));

      // Execute behavior
      const { nextState, effects } = proc.behavior(stateBefore, currentMsg);
      ...
    } catch (error: any) {
      runtime.metrics.messagesRefused++;
      const errorMsg = error.message || "Unknown error";
      const errHash = hash(errorMsg);
      ...
    }
    ```
    *Paraphrase:* Process-level exceptions are contained within a local try-catch block wrapping behavior execution. This ensures that failures inside one process do not disrupt the execution of adjacent processes or crash the main scheduling loop.

---

## 11. Receipt per Message

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L218-L226) (OTP runtime); [hook.ts](file:///Users/sac/truex/packages/membrane/src/hook.ts#L61-L69) (Primitive hook)
*   **Class/Function/Type Name:** `dispatchMessage` (function), `TruexHook.execute` (method)
*   **Line Range:** L218-226 and L237-245 (in `hook-otp.gall.ts`), L61-69 (in `hook.ts`)
*   **Source Quote / Implementation:**
    In `hook-otp.gall.ts` (Confirmed):
    ```typescript
    const confirmedReceipt = createReceipt(
      ctx,
      currentMsg.id,
      currentMsg.delta?.id || "unknown",
      inputHash,
      outputHash,
      proc.lastReceiptHash,
      "confirmed"
    );
    ```
    In `hook-otp.gall.ts` (Refused):
    ```typescript
    const refusedReceipt = createReceipt(
      ctx,
      currentMsg.id,
      currentMsg.delta?.id || "unknown",
      hash(currentMsg),
      errHash,
      proc.lastReceiptHash,
      "refused"
    );
    ```

---

## 12. Replay per Message

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L303-L326) (OTP runtime); [hook.ts](file:///Users/sac/truex/packages/membrane/src/hook.ts#L77-L91) (Primitive hook)
*   **Class/Function/Type Name:** `replayMessage` (function), `TruexHook.replay` (method)
*   **Line Range:** L303-326 (in `hook-otp.gall.ts`), L77-91 (in `hook.ts`)
*   **Source Quote / Implementation:**
    ```typescript
    export function replayMessage(
      stateBefore: any,
      msg: HookMessage,
      receipt: Receipt,
      behavior: (state: any, msg: any) => { nextState: any; effects: any[] }
    ): boolean {
      try {
        if (!verifyReceipt(receipt)) {
          return false;
        }

        const { nextState, effects } = behavior(stateBefore, msg);

        const inputHash = hash({ msg, stateBefore });
        const outputHash = hash({ effects, stateAfter: nextState });

        if (receipt.inputHash !== inputHash) return false;
        if (receipt.outputHash !== outputHash) return false;

        return true;
      } catch {
        return receipt.status === 'refused';
      }
    }
    ```

---

## 13. Deterministic Context

*   **File Path:** [context.ts](file:///Users/sac/truex/packages/membrane/src/context.ts#L11-L56)
*   **Class/Function/Type Name:** `createDeterministicContext` (function)
*   **Line Range:** L11-56
*   **Source Quote / Implementation:**
    ```typescript
    /**
     * Creates a deterministic operational context using a seeded Mulberry32 PRNG.
     * Ensures that clock calls and UUID generation are completely reproducible.
     */
    export function createDeterministicContext(seed: number): TruexContext {
    ```
    *Paraphrase:* Instantiates a deterministic context where UUIDs and time ticks (predictably incrementing by 1ms on each read) are derived from a seeded Mulberry32 pseudo-random number generator, eliminating external entropy and system clock dependency.

---

## 14. Backpressure/Capacity Refusal

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L176-L192)
*   **Class/Function/Type Name:** `dispatchMessage` (function)
*   **Line Range:** L176-192
*   **Source Quote / Implementation:**
    ```typescript
    // 3. Capacity Breach Check (Limit delta size to 100 changes)
    const addsCount = msg.delta?.adds?.length || 0;
    const deletesCount = msg.delta?.deletes?.length || 0;
    if (addsCount + deletesCount > 100) {
      runtime.metrics.messagesRefused++;
      const refusedReceipt = createReceipt(
        ctx,
        msg.id,
        msg.delta?.id || "unknown",
        hash(msg),
        hash("Capacity breach: too many changes"),
        proc.lastReceiptHash,
        "refused"
      );
      runtime.refusedReceipts.push(refusedReceipt);
      return { allowed: false, reason: "Capacity breach: too many changes", receipt: refusedReceipt };
    }
    ```

---

## 15. Lifecycle Report

*   **File Path:** [hook-otp.gall.ts](file:///Users/sac/truex/packages/membrane/src/hook-otp.gall.ts#L442-L491)
*   **Class/Function/Type Name:** `runHookOtpProof` (function)
*   **Line Range:** L442-491
*   **Source Quote / Implementation:**
    ```typescript
      const report: any = {
        case: "hook-otp-equivalence",
        status: "passed",
        otpEquivalentNotOtp: true,
        runtime: {
          processes: runtime.processes.size + 1, // include nonexistent search
          processesStarted: runtime.processes.size,
          processesAlive: Array.from(runtime.processes.values()).filter(p => !p.isHalted).length,
          processesQuarantined: new Set(runtime.quarantine.map(q => q.processId)).size,
          messagesDispatched: runtime.metrics.messagesDispatched,
          messagesProcessed: runtime.metrics.messagesProcessed,
          messagesConfirmed: runtime.metrics.messagesConfirmed,
          messagesRefused: runtime.metrics.messagesRefused,
          messagesQuarantined: runtime.quarantine.length,
          restarts: runtime.metrics.restarts,
          restartBudgetExhausted: runtime.quarantine.filter(q => q.error.includes("Budget exhausted")).length,
          fifoOrderingVerified: true,
          stateIsolationVerified: true,
          siblingCrashContainmentVerified: true
        },
        ...
    ```
    *Paraphrase:* The system compiles execution metrics (alive/quarantined processes, dispatched/processed/confirmed/refused messages, and verification results) into a structured report which is then cryptographically hashed to verify final convergence.
