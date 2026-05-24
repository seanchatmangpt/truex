# Reference: OTP Equivalence API

Truex achieves single-node, local TypeScript OTP-equivalence without BEAM, providing actor semantics over operational hooks.

## Key Interfaces

### `HookProcessRef`
Isolates mutable internal state per process.
```typescript
interface HookProcessRef {
  id: HookProcessId;
  mailbox: HookMailbox;
  state: 'idle' | 'running' | 'crashing' | 'quarantined' | 'terminated';
  internalState: any; 
  restartCount: number;
}
```

### `HookMailbox`
Enforces temporal geometry via strict FIFO queueing.
```typescript
interface HookMailbox {
  push(msg: HookMessage): void;
  pop(): HookMessage | undefined;
}
```

### `HookSupervisor`
Manages fault containment and restart budgets.
```typescript
class HookSupervisor {
  shouldRestart(processId: HookProcessId, currentTime: number): boolean;
}
```

## Runtime Guarantees
- **Message Dispatch:** Unknown processes are instantly refused.
- **Crash Containment:** A crash in Process A does not corrupt or halt Process B.
- **Poison Messages:** Repeated crashes exhaust the restart budget, leading to Quarantine.
- **Receipt Binding:** Every processed message, whether confirmed or refused, emits an unforgeable Receipt proving its lifecycle transition.