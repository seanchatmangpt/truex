# Truex /goal Command Guidelines

This document outlines the constitutional rules, templates, and best practices for executing `/goal` multi-agent missions in the Truex codebase.

---

## 1. Core Principles

1. **Multi-Agent Decomposition Trigger, Not Proof:**
   Treat `/goal` as a high-level coordinator of multi-agent tasks, not as the final validator of correctness. final authority resides in the `truex doctor prove` execution outcomes.
2. **No Fake Green:**
   Do not allow reports or agents to claim success without actual, verified runtime evidence, explicit attempt/success/fail metrics, and proper exit code checking.
3. **Decoupled Accounting Domains:**
   All execution outcomes must be reported in decoupled unit domains (e.g. `test_case`, `command_invocation`, `message`, `hook_delta_evaluation`, `journal_replay`, `subagent_run`) to prevent denominator collapse.
4. **Constrained Authority:**
   No speculative engineering, no distributed database claims, and no new top-level CLI nouns (only `doctor`, `wizard`, `telco` are allowed).

---

## 2. Agent Operational Domains

For all `/goal` runs, task decomposition must be mapped strictly to the following 5 domain roles:

| Agent | Domain | Focus Area |
| :--- | :--- | :--- |
| **Architect** | Scope + Law | Defines typestates, ontology, and minimal Gall interfaces. |
| **Implementer** | Smallest Runtime Primitive | Codes the minimal, structurally complete, production-ready runtime. |
| **Validator** | Tests + Commands | Implements comprehensive unit verification and drives proof runners. |
| **Stresser** | Adversarial Failure | Creates tampering, corruption, rollback, and quarantine stress tests. |
| **Synthesizer** | Reports + Observatory | Compiles decoupled precision reports and outputs observatory diagrams. |

---

## 3. Standard /goal Template

When invoking a new checkpoint mission, the prompt structure must adhere strictly to this template:

```markdown
/goal Complete Gall Checkpoint S<N>: <Checkpoint Name>

Repository: /Users/sac/truex

Mission:
<one-sentence operational checkpoint>

Current proven state:
- <prior layer 1>
- <prior layer 2>
- <prior layer 3>

Checkpoint must prove:
1. <capability>
2. <replay proof>
3. <failure/refusal proof>
4. <accounting proof>
5. <observatory proof>

Forbidden:
- no distributed claims
- no new top-level CLI nouns
- no product UI
- no fake green
- no hidden entropy regression
- no mixed denominators

Allowed CLI nouns:
- doctor
- wizard
- telco

Target command:
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove <target>

Agents:
1. Architect — define law and minimal Gall file
2. Implementer — implement smallest runtime primitive
3. Validator — add tests and run commands
4. Stresser — adversarial failure tests
5. Synthesizer — reports, accounting, observatory

Required reports:
- docs/benchmarks/<target>.report.json
- docs/benchmarks/<target>.report.md
- docs/reports/<TARGET>-SYNTHESIS.md

Required accounting domains:
- <domain 1>
- <domain 2>
- <domain 3>

Completion criteria:
- npx vitest run <test path>
- TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove <target>
- TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts
- npx vitest run

Final classification block:
<checkpoint-specific block>
```
