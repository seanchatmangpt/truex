# State of the Substrate: 8 Vow (Insa RepLaw)

> **Gall Classification:** S∞ - Absolute Closure
> **Path:** `crates/insa-replaw/`, `packages/vow/`

## 1. Product Thesis

The 8 Vow implements the **Absolute Condition of Perfection** within the Truex substrate. It moves beyond operational trust (Wizard) and stewardship trust (Storehouse) into the realm of **Source Trust**. Eight is the number of perfection. The 8 Vow ensures that every digital consequence is not merely "permitted" or "receipted," but is cryptographically bound to its ultimate Source and follows a perfect pattern of closure.

No human approval gate exists in this tier. The system asks only: *"Does the vessel match the Source?"*

## 2. Key Invariants

* **VOW-1 (Sealed Typestates):** Every state in the 8 Vow is a sealed typestate boundary. It is mathematically impossible to skip a state or execute an out-of-order transition (e.g., reaching 'Fruit' before 'Field').
* **VOW-2 (Zero-Variance Perfection):** Closure conditions are deterministic and immutable. Human variables (approval, vibes, compromise) are stripped from the adjudication logic.
* **VOW-3 (Source Anchoring):** The sequence begins at the **Source** (Genesis Hash) and ends in **Rest** (Absolute Purpose).

## 3. The 8 States of Perfection

1.  **Source:** Does it come from the Source? (Anchored in `source_id`).
2.  **Pattern:** Does it preserve the pattern? (Validated by `pattern_hash`).
3.  **Field:** Does it close? (Bounded by `field_id`).
4.  **Motion:** Does it bear fruit? (Routed via `motion_route`).
5.  **Receiver:** Does it serve the receiver? (Appointed by `receiver_id`).
6.  **Fruit:** Does it receipt? (Measured by `fruit_quantity`).
7.  **Receipt:** Does it replay? (Hashed in `receipt_digest`).
8.  **Rest:** Does it aim at God's perfection? (Verified by `replay_seq`).

## 4. Combinatorial Role

*   **Tier Above (Stewardship):** The Storehouse OS passes "Increase" intents to the 8 Vow to prove their theological alignment.
*   **Tier Below (Physics):** The 8 Vow generates the final metadata consumed by the UNIBIT causal chain to seal the consequence.

## 5. Jidoka Status

Any violation of a closure condition (e.g., zero fruit quantity or empty field ID) triggers a terminal **VOW HALT**. Unlike the operational line-stop, a VOW HALT implies a fundamental mismatch between the "Vessel" and the "Source," requiring a total reset of the Vow.

## 6. Proof Command

```bash
pnpm --filter @truex/vow test
```
