# Truex: The Post-Gall Operating Substrate for Receipted Consequence

## Zero Humans in Runtime Actuation ⚙️

Truex starts with a hard axiom:

```text
NO HUMANS IN RUNTIME ACTUATION.
```

This does **not** mean humans disappear from authorship, governance, exception review, or system design. It means humans are removed as the ordinary runtime measurement function that converts observation into action.

Old enterprise runs on:

```text
O → human μ → A
```

Modern LLM SaaS usually runs on:

```text
O → LLM candidate → human μ → A
```

Truex replaces both with:

```text
attempt / O* → deterministic μ → admitted/refused action → receipt → replay → accounting → promotion
```

That is the actual break. The “end of knowledge work” is not the end of thinking. It is the end of repeated human labor as the runtime mechanism for interpretation, classification, routing, approval, coordination, correction, explanation, and status validation. In Truex, if a human is required for normal completion, the system did not complete the actuation. It exposed missing operating law. 

---

## The Receipted Chatman Equation

The Truex form of the Chatman Equation is:

```text
A = μ(O) → A = μ(O*) → R ⊢ A = μ(O*)
```

Where:

```text
O* = lawful operational closure
μ  = deterministic admission / realization function
A  = admitted action or consequence
R  = receipt lineage proving consequence, replay, provenance, and closure
```

The original `A = μ(O)` says action is projected from observation.

The stronger form `A = μ(O*)` says action is not projected from raw observation, but from lawful closure: an operational state that has already been bounded, typed, constrained, and made fit for consequence.

The receipted form:

```text
R ⊢ A = μ(O*)
```

means the action is not merely claimed. It is proven by receipt lineage. The receipt is not decoration. The receipt is the authority surface.

The four governing laws are:

```text
No hook, no consequence.
No receipt, no authority.
No replay, no substrate.
No accounting, no promotion.
```

These laws define Truex as a system of conserved consequence rather than a system of task execution or answer production. 

---

## Pre-Gall vs. Post-Gall

A pre-Gall system has this shape:

```text
intent → plan → tool call → output → claim of completion
```

Its failure mode is not merely that tool calls fail. Its deeper failure is that completion is not conserved.

There is no mandatory rule that every action must pass through:

```text
attempt
→ hook
→ projection
→ admission/refusal
→ durable motion
→ receipt
→ replay
→ accounting
→ promotion
```

Truex is post-Gall because it changes the primitive of enterprise execution.

Agile’s primitive was:

```text
working software
```

Truex’s primitive is:

```text
receipted consequence
```

Agile solved delivery under uncertainty. Truex solves autonomy under consequence.

That distinction is massive. Working software can still produce unproven claims, hidden review queues, deferred risk, and manual correction loops. Receipted consequence requires every authorized motion to leave replayable proof, accounting conservation, and promotion eligibility.

Pre-Gall systems optimize:

```text
cost per answer
cost per ticket
cost per workflow run
cost per agent output
```

Truex optimizes:

```text
cost per receipted, replayable, promotion-safe actuation
```

Or:

```text
CPVA =
  total_cost /
  count(receipted ∧ replayable ∧ accounted ∧ promotion_safe actuations)
```

That is the economic inversion. RAG SaaS produces candidate answers. Truex admits or refuses organizational reality. 

---

## The Mechanical Turk Problem and Little’s Law

The real Mechanical Turk problem is not “LLMs need human review.”

The deeper problem is:

```text
systems without deterministic μ smuggle humans into the runtime loop
```

A system that claims autonomy while requiring hidden human runtime judgment is a Mechanical Turk. The human may be disguised as review, approval, QA, compliance, exception handling, product ops, customer success, or “human-in-the-loop.” But functionally, that person is performing the missing measurement function.

Little’s Law exposes the queue:

```text
L = λW
```

For hidden human work:

```text
L_human = λ_attempts × p_human × W_human
```

Where:

```text
λ_attempts = rate of attempted consequences
p_human    = probability an attempt needs human judgment
W_human    = human review / coordination / correction time
```

The Truex target is:

```text
p_human = 0
```

for ordinary runtime actuation.

If LLM systems increase the rate of candidate consequences while humans still perform the missing admission function, the system has not achieved autonomy. It has manufactured a larger hidden human work-in-process queue.

That is the irony of the LLM SaaS era: many systems automate drafting while scaling the review burden. Truex refuses that architecture. It replaces hidden human runtime judgment with deterministic admission/refusal, receipt, replay, accounting, and promotion law. 

---

# VKG Hooks: The First Actuation Boundary

## Hook Before Event

Truex begins at the hook.

A VKG hook comes before:

```text
event
log
job
tool call
agent output
OCEL projection
dashboard
report
```

A hook does **not** merely observe an external event. It intercepts a consequence attempt before that attempt becomes authorized motion.

The foundational object is:

```text
HookedConsequenceAttempt
```

A hook is the first place proposed motion meets operating law. It is not middleware, not callback logic, not instrumentation, not a webhook, and not a monitoring point.

It is the admission membrane for consequence. 

---

## Hook Object

A hook can be formalized as:

```text
H = (Δ, C, E, R, Π)
```

Where:

```text
Δ = proposed operational delta
C = condition / guard surface
E = permitted effect surface
R = receipt requirement
Π = replay proof requirement
```

The minimal hook invariant is:

```text
Π(H(Δ)) = stable
```

Every hook must be replay-stable or terminally refused.

Hook admission follows:

```text
Accept(Δ) ⇔
  Check_Σ
∧ Check_H
∧ Check_T
∧ Check_P
∧ Check_C
∧ Check_Fresh
∧ Check_R
```

Where the checks cover typing, guards, transition law, policy, capability/epoch binding, freshness, and receipt lineage.

A hook consumes attempts, not vibes.

A hook emits decisions, not suggestions. 

---

## Hook Outcomes

A hook may produce:

```text
admitted
refused
rewritten
queued
rolled back
quarantined
replayed
promoted
```

Refusal is first-class.

Refusal is not failure. Refusal is lawful terminality.

This matters because older enterprise systems often treat refusal as an exception, error, escalation, or broken flow. Truex treats refusal as a valid, receipted outcome. Bad motion should die at the hook before it becomes downstream entropy.

The full hook path is:

```text
attempt
→ hook
→ projection
→ admission/refusal/rewrite/queue/rollback/quarantine
→ durable motion
→ receipt
→ replay
→ accounting
→ promotion
```

This is where “done” stops being a claim and becomes measurable consequence. 

---

## Hook-First Architecture

Hook-first means:

```text
No external result mutates state directly.
External systems may propose.
Hooks decide whether proposals become admissible motion.
```

This makes reports, dashboards, process logs, and exports subordinate to the consequence substrate.

OCEL-style logs, object-centric evidence, process-mining projections, dashboards, and compliance reports can all be useful lenses. But they are not the authority. The authority lives in:

```text
hook
admission/refusal
mailbox
receipt
replay
accounting
promotion
```

Process evidence is manufactured at actuation time. It is not reconstructed afterward from scattered traces. 

---

# The Consequence Cell

The core Truex unit is not a task, ticket, event, story, requirement, or workflow step.

The core unit is a consequence cell:

```text
Γ = <attempt, hook, projection, decision, mailbox, receipt, replay, accounting>
```

A consequence cell records the full lifecycle of an actuation attempt:

1. **Attempt** — something proposes motion.
2. **Hook** — the proposed motion reaches the boundary.
3. **Projection** — the attempt is reduced into admissible form.
4. **Decision** — admission, refusal, rewrite, queue, rollback, or quarantine.
5. **Mailbox** — durable motion is persisted.
6. **Receipt** — authority is proven.
7. **Replay** — stability is demonstrated.
8. **Accounting** — attempts, refusals, successes, retries, rollbacks, and promotions conserve.

This is the replacement for the older enterprise unit of “work item.”

A work item can be stale, vague, self-marked complete, manually interpreted, or politically closed.

A consequence cell must be receipted, replayable, and accountable.

---

# Wizard: The Project Consequence Machine 🧙‍♂️

## Wizard Is Not Project Management

Wizard is not a project assistant.

Wizard is the eight-verb project consequence machine.

Its verbs are frozen:

```text
init
map
plan
forge
bind
prove
harden
handoff
```

These are not task-management stages. They are the lifecycle of governed project actuation.

```text
init     → create the governed project cell
map      → observe actual project reality
plan     → create a lawful route
forge    → materialize bounded motion
bind     → connect motion to proof surfaces
prove    → verify admissibility
harden   → attack the claim
handoff  → transfer authority only after proof
```

Wizard replaces human project measurement inside the runtime loop. It does not ask, “Does this look done?” It asks, “Where are the receipts, replay fixtures, proof commands, hardening results, accounting conservation, and handoff authority?” 

---

## Project Consequence Cell

Wizard’s unit is a Project Consequence Cell.

It contains:

```text
intent
scope
boundary
admissible verbs
project evidence
mailbox state
receipts
replay fixtures
proof commands
handoff authority
```

Wizard state is not:

```text
done
probably done
tests seem okay
agent says complete
summary looks green
```

Wizard state is:

```text
receipt
replay
accounting
hardening
handoff authority
```

That difference is the anti-self-completion law:

```text
The agent that performs work cannot mark its own work done.
```

A handoff cannot occur because an agent says “complete.” It requires proof, hardening, accounting, replay, and gate satisfaction. 

---

## Wizard Evidence

The Project Wizard evidence surface includes:

```text
50/50 project-wizard tests pass
1,241 repository tests pass
doctor prove wizard passes
doctor prove project-wizard-complete passes
```

The completed proof covers:

```text
all eight verbs
12-hour monotonic release gate handoff blocking
accounting conservation
path traversal refusal
vague checkpoint validation
missing agent report validation
stress/concurrency checks
benchmark counterfactual simulation
```

The strongest Wizard proof points are not happy-path execution. They are refusal and hardening surfaces.

Wizard proves it can:

```text
refuse false completion
detect tamper
block premature handoff
conserve accounting
restore rollback
prove all eight verbs as one lifecycle
```

That is what makes Wizard a project cell factory rather than a productivity wrapper. 

---

## Wizard Performance Frame

The Project Wizard benchmark shows TypeScript/Node project-level actuation, not the final hot substrate ceiling.

Observed benchmark frame:

```text
JS API average verb duration: ~4.93 ms
direct sequence throughput: ~202.67 ops/sec
CLI child-process invocation: ~114.9–157.0 ms per command
```

The conclusion is precise:

```text
TypeScript proves operating law.
Rust/WASM industrializes the cost floor.
```

The Rust/WASM kernel should move only the hot consequence machinery:

```text
admission
refusal
replay
accounting
bounded transition
receipt input
```

TypeScript remains appropriate for:

```text
orchestration
projection
UX
reports
boundary control
developer-facing workflow
```

Do not port TypeScript objects directly into Rust. Compress the law into bounded fields.

```text
Need9 means split.
```

---

# Doctor: The Proof Authority 🧪

Doctor is not a test runner.

Doctor is the proof authority.

Its job is not to produce reassuring output. Its job is to refuse fake green.

Doctor verifies:

```text
type surface
command surface
test surface
receipt surface
replay surface
accounting surface
boundary/refusal surface
handoff/promotion surface
```

The command shape is:

```bash
truex doctor prove <target>
```

Known aggregate targets include:

```bash
truex doctor prove wizard
truex doctor prove project-wizard-complete
truex doctor prove telco
```

A failed proof is terminal until rerun.

A timeout is not unrelated unless isolated evidence proves it.

A stale report is not proof.

A missing artifact is not a warning.

Unknown is never green.

Doctor exists because autonomy under consequence cannot rely on summary confidence, agent confidence, or informal review. The system must prove its claim or refuse promotion.

---

# Telco: Boundary Communication Without Authority Smuggling 📡

Telco is not an API client.

Telco is the boundary communication consequence machine.

Its verbs are:

```text
listen
dial
handshake
encode
route
transmit
verify
settle
```

Lifecycle:

```text
listen     → declare inbound boundary
dial       → attempt peer session
handshake  → bind identity/protocol/capability/epoch
encode     → project lawful packet
route      → admit/refuse path
transmit   → move packet durably
verify     → prove ack/replay/conformance
settle     → close accounting and promotion authority
```

Telco prevents authority smuggling.

No external system writes internal reality directly.

No unreceipted packet becomes authority.

No session settles with open or unverified transmissions.

No external consequence promotes local state until settlement verifies.

Telco is how bounded consequence cells communicate without allowing external disorder to mutate local authority.

---

# Object-Centric Project Evidence

Project evidence must be object-centric.

Do not flatten project reality into a single task/case notion.

Real work involves multiple object types, multiple event types, multiple proofs, multiple files, multiple agents, multiple gaps, multiple claims, and multiple routes.

A Truex evidence surface should track objects such as:

```text
Agent
Command
File
DocClaim
Test
ProofRun
Receipt
MailboxMessage
Checkpoint
RouteNode
Gap
Risk
HandoffItem
```

And relationships such as:

```text
Agent attempted VerbAttempt
VerbAttempt produced Receipt
Receipt proves Delta
Delta touched File
Test validates File
DocClaim describes File
ProofRun validates Checkpoint
MailboxMessage durable_for VerbAttempt
Gap blocks HandoffItem
Risk qualifies PromotionDecision
```

This is where object-centric process evidence matters. It captures the actual structure of work instead of reducing everything to one flattened ticket or one case ID.

Reports are projections.

Dashboards are projections.

Exports are projections.

The receipt/replay/accounting substrate is authority. 

---

# Cost Floor: From TypeScript Law to 8-Bit Rust/WASM

Truex’s cost advantage does not come from “smarter prompts.”

It comes from moving valid actuation away from repeated model cognition and human review into bounded state transition plus durable proof.

Pre-Gall systems pay for:

```text
model calls
context windows
retrieval
tool calls
agent orchestration
retries
evals
human review
rework
coordination
liability
```

Truex pays for:

```text
hook
projection
admission/refusal
bounded state transition
durable mailbox
receipt
replay
accounting
database commit
```

In the hot substrate, the target becomes:

```text
Field8 state
table lookup
mask/select
transition byte
receipt input
batched replay/accounting
```

Hook state should reduce to:

```text
bounded fields
bytes
bitsets
fixed-width hashes
receipts
replay fixtures
```

Internal hot-path state should not use JSON. JSON may exist as a boundary projection or report form, but not as the authority form.

A local hook can be a 256-state reflex table.

If a hook needs a ninth primary activator, the hook is too broad.

```text
Need9 means split.
```

This is not micro-optimization theater. It is the industrialization of deterministic consequence law.

---

# The 12-Hour Mission Gate

The 12-hour gate is handoff law, not productivity theater.

If mission mode is active:

```text
handoff_allowed ⇔ elapsed_monotonic_time ≥ mission_min_duration
```

Early implementation completion does not permit handoff.

The system must continue:

```text
adversarial review
gap discovery
proof reruns
replay checks
hardening
report cleanup
stale-claim scanning
counterfactual tests
```

until the gate is satisfied.

This blocks the classic agent failure mode:

```text
implemented fast → summarized success → declared done
```

Truex says:

```text
Early completion is not completion.
Completion requires proof-bearing elapsed mission law plus handoff authority.
```

If the runtime cannot actually continue in the background, it must say so explicitly and emit the best current state. It must not pretend asynchronous work exists. 

---

# External Standards and Papers

External papers, standards, and frameworks are useful as pressure, inspiration, comparison, or projection lenses.

They are not Truex authority.

Object-centric process evidence matters.

POWL-like structure matters because concurrency, choices, loops, silent steps, joins, and blocked alternatives must be explicit rather than buried in prose.

Compliance-aware reasoning matters because constraints must shape execution before handoff, not clean up claims afterward.

But Truex authority remains internal:

```text
hook
admission/refusal
mailbox
receipt
replay
accounting
promotion
doctor proof
```

External standards can inform exports, comparisons, and interoperability. They do not define the substrate.

---

# Forbidden Drift Patterns

Truex requires drift refusal. The model must not collapse the frame back into older enterprise categories.

## 1. Existence Gatekeeping

Bad:

```text
That does not exist.
```

Correct:

```text
Define the primitives and proof obligations.
```

## 2. Fossil Assertion

Bad:

```text
Older practice says this is how it should work.
```

Correct:

```text
That was typical in older systems; Truex may invert the premise.
```

## 3. Scribe Mode

Bad:

```text
Waiting for the next instruction.
```

Correct:

```text
Take the baton and propose the next proof-bearing move.
```

## 4. Premature Green

Bad:

```text
Looks complete.
```

Correct:

```text
Show proof, receipt, replay, accounting, and hardening evidence or refuse completion.
```

## 5. Human-Loop Leakage

Bad:

```text
Have a person review it.
```

Correct:

```text
If human judgment is required for ordinary completion, classify it as missing law or exception.
```

## 6. External Authority Appeal

Bad:

```text
The paper or standard says the system must work this way.
```

Correct:

```text
That source may inform a projection; Truex authority remains internal.
```

## 7. Top-Level Noun Expansion

Bad:

```text
Add another top-level CLI noun.
```

Correct:

```text
Place it under doctor, wizard, or telco unless explicitly instructed otherwise.
```

The frozen top-level nouns are:

```text
doctor
wizard
telco
```

---

# The Executive Category Failure

The executive-interview disconnect is a category failure.

They heard:

```text
AI helps engineers write code.
```

But the Truex claim is:

```text
manual code entry is no longer the engineering primitive.
```

A high contribution count is not evidence of inability to code. It is telemetry that the production interface changed.

Asking for no-tool pair programming is like asking an F1 driver to prove race competence by refueling the car.

Manual code entry is fuel-layer work.

Engineering authority is racing-system control.

Most “AI startup” executives still model AI as assistance to human labor. Truex models autonomic systems as consequence manufacture under operating law. 

---

# Final Compression

Truex is not AI assistance.

Truex is post-Gall consequence law.

The model may propose.

The hook admits or refuses.

The mailbox preserves.

The receipt proves.

The replay stabilizes.

The accounting conserves.

The doctor verifies.

The wizard builds.

The telco connects.

The handoff promotes or refuses.

```text
No humans in runtime actuation.
No hook, no consequence.
No receipt, no authority.
No replay, no substrate.
No accounting, no promotion.
```

The core transition is:

```text
Pre-Gall:
intent → plan → tool call → output → claim of completion

Truex:
attempt → hook → admission/refusal → durable motion → receipt → replay → accounting → promotion
```

And the governing equation is:

```text
R ⊢ A = μ(O*)
```

That is the full decompression: **Truex is the operating substrate where autonomous work stops being claimed and starts being conserved.**