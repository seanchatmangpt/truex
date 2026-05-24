# Truex Documentation Guidelines

Truex is the Post-Gall Operating Substrate for Receipted Consequence. Our documentation must reflect the same deterministic, proof-bearing, and rigorous standards as our runtime. 

In Truex, documentation is not a speculative narrative, nor is it a marketing claim. Documentation is the **projection of proven authority**.

---

## 1. Core Documentation Axioms

### Axiom 1: No Fake Green
Do not document features, behaviors, or capacities that are merely "planned," "expected," or "usually true." If a behavior cannot be proven via `truex doctor prove`, it does not exist in the substrate.
* **Bad:** "The system automatically recovers from all crashes."
* **Good:** "The system emits a `timeout` receipt if acknowledgment is missing, which triggers the retry policy."

### Axiom 2: Object-Centric Process Evidence
Documentation must describe reality in terms of discrete, bounded objects rather than flattened processes.
* **Bad:** "When a user submits a request, the system processes it and saves the result."
* **Good:** "A `HookedConsequenceAttempt` is evaluated by the `TelcoSession` which, upon admission, emits a `TelcoReceipt` and durably writes to the `TransmissionMailbox`."

### Axiom 3: Refusal is First-Class
Happy-path execution is only half the system. Our documentation must explicitly specify what the system **refuses** to do, what it drops, what it quarantines, and what it rolls back.
* Always document the **Refusal Conditions** (the failure envelope) for any module, verb, or hook.

### Axiom 4: Grammar of Consequence
Avoid vague action verbs. Use the precise Truex vocabulary:
* Use **Attempt**, not *Try* or *Request*.
* Use **Admit/Refuse**, not *Accept/Reject* or *Pass/Fail*.
* Use **Project**, not *Transform* or *Convert*.
* Use **Conserve**, not *Balance* or *Complete*.
* Use **Promote**, not *Finish* or *Apply*.

---

## 2. Structure of a Truex Report / Artifact

When writing synthesis reports (e.g., Gall Checkpoint reports, Benchmark outcomes), the document must contain:

1. **Product Thesis:** What is the fundamental boundary law or consequence this module manufactures?
2. **Accounting Domains:** What are the conserved mathematical domains (e.g., W1-W5, T1-T6) required for settlement?
3. **Key Invariants:** What must remain true for the system to not panic or refuse motion?
4. **Verbs/Commands:** What are the exact CLI primitives (e.g., `init`, `map`, `listen`, `dial`)?
5. **Refusal Conditions:** What exact conditions result in terminal refusal?
6. **Proof Command:** The exact `doctor prove` or `vitest` command required to verify this truth.

---

## 3. The Tone

The tone of Truex documentation is:
* **Assertive:** State what the system does. Do not use "should," "might," or "probably."
* **Rigorous:** Treat every sentence as a binding contract.
* **Terse:** Compress the law. If a concept requires 9 paragraphs, it is too broad. *"Need 9 means split."*
* **Mechanical:** Truex is an industrial consequence machine, not a human assistant.

---

## 4. Documentation Workflow

1. **Implement First, Document Second:** Never write documentation for unmerged, unproven code. The code and its test/proof harness must exist first.
2. **Update the Integration Map:** If your documentation introduces new reports or architectural components, ensure they are registered in the project's integration maps (`.truex/reports/integration-map.json`).
3. **Run the Synthesizer:** If you are using multi-agent `/goal` prompts, rely on the **Synthesizer Agent** to format the final Markdown.
4. **Peer Review for Law:** Reviewers will check documentation not just for typos, but for violations of the Post-Gall substrate law (e.g., implying human-in-the-loop dependencies).

---

## 5. Architectural Documents vs. Guides

* **Manifestos & Law (`docs/MANIFESTO.md`, `docs/reports/GALL-CHECKPOINTS-*.md`):** These dictate the ontological rules of the substrate. They are frozen and rarely change.
* **Benchmarks & Reports (`docs/benchmarks/`, `docs/reports/`):** These are deterministic read-outs of point-in-time system performance and proof outcomes. They are generated and immutable for that epoch.
* **Guides & Tutorials (`docs/introduction.md`):** These teach developers how to build atop the substrate. They must always link back to the foundational laws to prevent conceptual drift.