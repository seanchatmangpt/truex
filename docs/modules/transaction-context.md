# Module: Transactions

> **Path:** `src/transactions/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Transactions module provides the rollback and journaling substrate for Truex consequence cells. Instead of executing isolated mutations that leave the system in an unknown state upon failure, this module intercepts and tracks every operational delta (`Δ`) into a deterministic journal. 

If any downstream boundary (like the Invariants or ACL modules) triggers a terminal refusal, the Transaction module allows the state to be deterministically inverted (rolled back) to its previous clean state. It provides a formal Write-Ahead Log (WAL) for local memory mutations.

## 2. Accounting Domains

* **Nesting Depth Budget:** The execution bounds enforce a strict depth limit (`maxDepth`) to prevent runaway transaction nesting and deadlocks. `transaction_depth <= maxDepth`.

## 3. Key Invariants

* **TX-1 (Reversible Mutations):** No state mutation (`set`, `deleteProperty`) occurs within an active transaction without its deterministic inverse (e.g., `previousValue` or `hadProperty` status) being recorded in the transaction journal.
* **TX-2 (All-or-Nothing Completeness):** A transaction is either fully committed or fully rolled back. Partial states are never promoted outside of the `call()` boundary.
* **TX-3 (Depth Control):** Re-entry and nested transactions are tracked. Exceeding the depth boundary results in a terminal `RecursionRefusalError`.

## 4. Verbs / Commands

* `createTransactionContext(target, options)`: Creates the transaction engine and initializes the journal state for a given membrane.
* `registerTransactionInterceptors(proxyInterface, txCtx)`: Hooks the transaction journaling interceptors onto the `set`, `deleteProperty`, `apply`, and `construct` operations.
* `call(fn)`: Executes the function block inside the active transaction boundary.
* `commit()`: Formally accepts the journaled mutations, clearing the journal.
* `rollback()`: Inverts every journaled mutation in reverse-chronological order, restoring the substrate to its pre-transaction state.
* `getDryRun()` / `getJournal()`: Projects the proposed or executed mutations without altering the active state.

## 5. Refusal Conditions

The Transaction Context explicitly enforces the following refusals:
* Throws `RecursionRefusalError` if `transaction_depth > limit`.
* Throws an `Error` if `commit()` or `rollback()` is attempted when there is no active transaction.

*Note: While the module itself doesn't frequently refuse valid Javascript mutations, its primary purpose is to safely absorb and execute the refusals triggered by other modules (like Invariants).*

## 6. Proof Command

To prove the transactional isolation and rollback capabilities:

```bash
npx vitest run test/transactions/
```