# Package: @truex/contracts

> **Path:** `packages/contracts/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Contracts package defines the **Admissibility and Verification Protocol**. It provides the core data structures for receipts, hash verification, and budget management. It acts as the "Law Library," containing the bridge logic for Erlang, AtomVM, and Prolog8 compilers, as well as the budget-enforcement mechanisms that prevent unstructured execution.

## 2. Key Invariants

* **CON-1 (Receipt Continuity):** Every receipt must contain a valid `parentReceiptHash`, forming an unbroken chain of authority back to the genesis block.
* **CON-2 (Budget Conservation):** Execution fuel and temporal budgets must be strictly conserved and never overflow.

## 3. Verbs / Commands

* `contracts.verify(receipt)`: Validates the BLAKE3 signature of a receipt.
* `contracts.budget.consume(fuel)`: Deducts fuel from the active execution context.

## 4. Refusal Conditions

The Contracts engine refuses a receipt if:
* The hash link to the previous receipt is broken.
* The execution budget has been exceeded.
* The protocol sequence is out of order.

## 5. Proof Command

```bash
pnpm --filter @truex/contracts test
```