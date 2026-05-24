# How To: Layer Multiple Capabilities (The Swarm)

**Problem:** You need a highly secure object that enforces type invariants, tracks mutations transactionally, and logs everything to an audit trail.

**Solution:** Proxyable is designed for composition. You can stack interceptors.

```javascript
import { 
  createProxy,
  createInvariantContext, registerInvariantInterceptors, rangeInvariant,
  createTransactionContext, registerTransactionInterceptors,
  createAuditContext, registerAuditInterceptors
} from 'truex-core';

const bankAccount = { balance: 1000 };
const proxyInterface = createProxy(bankAccount);

// 1. Audit Logger (runs first to log attempts)
const audit = createAuditContext(bankAccount);
registerAuditInterceptors(proxyInterface, audit);

// 2. Transactions (wraps mutations)
const tx = createTransactionContext(bankAccount);
registerTransactionInterceptors(proxyInterface, tx);

// 3. Invariants (runs last to block bad state)
const inv = createInvariantContext(bankAccount, {
  positiveBalance: rangeInvariant('balance', 0, Infinity)
});
registerInvariantInterceptors(proxyInterface, inv);

const { proxy } = proxyInterface;

tx.call(() => {
  proxy.balance -= 500; // Success -> Logged
  try {
    proxy.balance -= 600; // Fails invariant (balance = -100)
  } catch(e) {
    tx.rollback(); // Reverts balance back to 1000
  }
});
```