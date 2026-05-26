# Experimental Project Report: speckit-ralph

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/speckit-ralph`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `speckit-ralph/Makefile`
- `speckit-ralph/adapters/_common.sh`
- `speckit-ralph/adapters/_frozen.sh`
- `speckit-ralph/adapters/_shim.sh`
- `speckit-ralph/adapters/chatmangpt-canopy-backend.sh`
- `speckit-ralph/adapters/chatmangpt-unrdf.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-1.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-10.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-11.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-12.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-13.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-14.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-15.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-16.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-17.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-18.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-2.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-3.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-4.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-5.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-6.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-7.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-8.sh`
- `speckit-ralph/adapters/chatmangpt-v2-unit-9.sh`
- `speckit-ralph/adapters/chatmangpt.sh`
- `speckit-ralph/adapters/clap-noun-verb.sh`
- `speckit-ralph/adapters/clnrm.sh`
- `speckit-ralph/adapters/dis.sh`
- `speckit-ralph/adapters/dteam.sh`
- `speckit-ralph/adapters/ggen.sh`
- `speckit-ralph/adapters/knhk.sh`
- `speckit-ralph/adapters/mcpp.sh`
- `speckit-ralph/adapters/open-ontologies.sh`
- `speckit-ralph/adapters/ostar.sh`
- `speckit-ralph/adapters/speckit-ralph.sh`
- `speckit-ralph/adapters/unibit.sh`
- `speckit-ralph/adapters/unrdf-clean.sh`
- `speckit-ralph/adapters/yawl.sh`
- `speckit-ralph/automate_062.sh`
- `speckit-ralph/automate_063.sh`
- `speckit-ralph/bin/compute-convergence.sh`
- `speckit-ralph/bin/render-dashboard.sh`
- `speckit-ralph/generate_robust_skeletons.sh`
- `speckit-ralph/generate_skeletons.sh`
- `speckit-ralph/kernel/lib/andon.sh`
- `speckit-ralph/kernel/lib/chain.sh`
- `speckit-ralph/kernel/lib/dispatch.sh`
- `speckit-ralph/kernel/lib/heijunka.sh`
- `speckit-ralph/kernel/lib/state.sh`
- `speckit-ralph/kernel/tests/tick_dteam.sh`
- `speckit-ralph/scaffold-trial-init/Makefile`
- `speckit-ralph/scaffold-trial-init-2/Makefile`
- `speckit-ralph/scaffold-trial-init-2/scripts/startup.sh`
- `speckit-ralph/scripts/agent.sh`
- `speckit-ralph/scripts/aggregate-convergence.sh`
- `speckit-ralph/scripts/bootstrap.sh`
- `speckit-ralph/scripts/cache-key.sh`
- `speckit-ralph/scripts/claude-invoke.sh`
- `speckit-ralph/scripts/copilot-shim.sh`
- `speckit-ralph/scripts/cost-append.sh`
- `speckit-ralph/scripts/cost-weekly.sh`
- `speckit-ralph/scripts/discover-specify.sh`
- `speckit-ralph/scripts/dispatch.sh`
- `speckit-ralph/scripts/gemini-invoke.sh`
- `speckit-ralph/scripts/oauth-check.sh`
- `speckit-ralph/scripts/rate-backoff.sh`
- `speckit-ralph/scripts/run_poe_test.sh`
- `speckit-ralph/scripts/run_test_ble001.sh`
- `speckit-ralph/scripts/validate-001-gate.sh`
- `speckit-ralph/scripts/validate-convergence.sh`
- `speckit-ralph/scripts/verify-bootstrap.sh`
- `speckit-ralph/sos/bullshit_scanner.sh`
- `speckit-ralph/tests/adapters/test_observe_returns_valid_json.sh`
- `speckit-ralph/tools/repo-state/render-dashboard.sh`
- `speckit-ralph/tools/repo-state/repo-state.sh`

## 3. Extracted Documentation & Context
### Source: `speckit-ralph/AGENTS.md`
```markdown
<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

...
```

### Source: `speckit-ralph/AUTONOMIC-OPEN-ONTOLOGIES-PLAN.md`
```markdown
# Open-Ontologies Autonomic Execution Plan
_Generated 2026-05-18T22:00:00Z. Provenance receipt in .portfolio/chain.json._

## 0. Dispatch mode (defended choice)
**Mode chosen:** Manual drain (Option B). Drop obligations one at a time, run `.portfolio/tools/gemini-drain.sh` manually between each, and block on Sean's approval of the receipt before dispatching the next.
**Reasoning:** The 5-step autonomic sequence introduces severe blast-radius risks. Autonomic looping combined with adapter bugs risks runaway namespace divergence [memory:feedback-namespace-singularity], audit-bypass fabrication [autonomic:6.2], and destructive SQL execution [autonomic:6.3]. A manual drain ensures halt conditions are evaluated at each boundary, protecting Sean's lift authority.

## 1. Step 1 — Patch legacy gemini invocations
- **Vehicle:** Portfolio obligation
- **Scope:** `open-ontologies` cell, targeting `scripts/` and any bash files invoking the CLI.
- **Halt condition:** `grep -r "gemini " scripts/` must return 0; all invocations must use `npx -y @google/gemini-cli` [transcript:711d1ee0-e054-4566-9d11-ef8ef9673820].
- **Verification:** CI passes and obligation receipt emits successfully.

{
  "id": "patch-legacy-gemini-invocations",
  "cell": "open-ontologies",
  "kind": "refactor",
  "verb": "replace",
  "target": "scripts/",
  "agent_pref": "gemini",
  "execution": "llm",
  "description": "Find all legacy 'gemini' CLI invocations in open-ontologies and patch them to use the portfolio standard 'npx -y @google/gemini-cli'. Retain existing flags like --yolo or --approval-mode.",
  "priority": 10,
  "created_at": "2026-05-18T22:00:00Z"
}

## 2. Step 2 — Wire open-ontologies.sh adapter to gemini-do.sh
- **Vehicle:** Portfolio obligation
- **Scope:** `speckit-ralph` cell, targeting `adapters/open-ontologies.sh` [file:adapters/open-ontologies.sh] and `.portfolio/tools/gemini-do.sh` [file:.portfolio/tools/gemini-do.sh].
- **Halt condition:** The adapter must implement the 4-verb contract (observe, extract, execute, verify) without syntax errors [transcript:85ddf8ec-3a54-4586-ac70-34108c20d457].
- **Verification:** Execute `adapters/open-ontologies.sh observe` and confirm it returns valid cell JSON stats.

{
  "id": "wire-open-ontologies-adapter",
  "cell": "speckit-ralph",
  "kind": "feature",
  "verb": "implement",
  "target": "adapters/open-ontologies.sh",
  "agent_pref": "gemini",
  "execution": "llm",
...
```

### Source: `speckit-ralph/AUTONOMIC-OPEN-ONTOLOGIES.md`
```markdown
# open-ontologies × gemini: autonomic readiness
_Generated 2026-05-18. Provenance receipt in .portfolio/chain.json._

## 1. Current gemini surface in open-ontologies

- **`resolve_llm_engine` cascade (`src/config.rs` implied)**: `[commit:d7d88d3]` Fallback cascade routes requests via `groq_pm4py` → `gemini` → `inproc`.
- **`onto_translate_candidate` tool (`src/server.rs` implied)**: `[transcript:ec324c5f-7e29-477c-b1bb-c394f10654d8]` Partially wired to use Gemini as a subprocess. Invokes `gemini -p "$prompt" --model gemini-3.1-flash-lite-preview --approval-mode yolo` and extracts trailing JSON. OAuth handles authentication; no API key needed.
- **`onto_executive_projection` tool**: `[commit:4b085e5]` Contains a specific Gemini execution branch added before the in-process fallback path.
- **`onto_gemini_status` tool**: `[commit:4b085e5]`, `[commit:94ed482]` A registered MCP tool (one of 87) that reports Gemini status. Wired to emit sites `[commit:82f48ef]` and documented in `CLAUDE.md` reference tables `[transcript:ec324c5f-7e29-477c-b1bb-c394f10654d8]`.
- **`VALID_LLM_ENGINES` & `ENGINE_GEMINI` constants**: `[commit:82f48ef]`, `[commit:94ed482]` Declared to support Gemini resolution at the configuration level.
- **Invocation CLI mismatch**: `[transcript:ec324c5f-7e29-477c-b1bb-c394f10654d8]` open-ontologies assumes the legacy bare `gemini -p` invocation. It has not yet been patched to the `npx -y @google/gemini-cli -p` format implemented in `[transcript:711d1ee0-e054-4566-9d11-ef8ef9673820]`.

## 2. Manufacturing-pipeline stages

- **Ontology authoring (TTL editing)**: Source of truth. Example: `ontology/zoela/*.ttl`. `[memory:feedback_manufacturing_doctrine]`. Currently driven by `[claude]`/`[human]` (e.g., `[commit:7f01ca2]` public-anchor closure for 17 unanchored classes). 
- **Validation**: Enforces SHACL shapes and namespace singularity (`https://zoela.org/ontology/`). Driven by `[bash]`/`[cargo-make]`/`[npm-script]` via `pnpm validate:all`, `tools/validate-namespace-singularity.sh`, and `make adversarial` `[memory:feedback_namespace_singularity.md]`, `[transcript:612faa7d-182e-4b94-94d7-2e24e1c0f2f2]`.
- **SPARQL extraction (μ₂)**: Extracts public materializations, screens, navigation. Example: `.specify/queries/zoela/extract-public-materializations.rq` `[commit:e55b72a]`. Driven by `[ggen]`.
- **Tera template materialization (μ₃)**: Consumes SPARQL facts to generate artifacts. Example: `supabase-migration.tera` `[commit:a41cec8]`. Driven by `[ggen]`.
- **Canonical runtime artifacts (μ₄ validate, μ₅ emit)**: Supabase migrations and Expo mobile threshold surfaces emitted directly into the `supabase/` and `packages/` directories `[commit:974ad35]`. Driven by `[ggen]`.
- **Receipt emission**: `[snapshot:open-ontologies]` `.ggen/receipts` tracks 94 entries verified via EARL verifier. `mcpp` maintains `.mcpp/chain.jsonl` `[snapshot:mcpp]`. Driven by `[ggen]`/`[bash]`/`[cargo-make]` (e.g., `verify-receipts.sh` `[commit:68f3972]`).
- **Conformance replay (truex-kernel)**: `mcpp ocel replay --global` evaluates OCEL logs against POWL v2 discovery `[memory:project_mcpp_truex-kernel_boundary]`. Driven by `[mcpp CLI]`/`[claude]`.
- **Admission gates**: Evaluates conformance. Doctor classifies into `RouteConformanceFailed`, `MissingRouteActivity`, etc. `[memory:project_mcpp_truex-kernel_boundary]`. Driven by `[mcpp]`.

## 3. Autonomic gap

- **Legacy Gemini Invocation**: open-ontologies still shells out to `gemini -p ... --approval-mode yolo` `[transcript:ec324c5f-7e29-477c-b1bb-c394f10654d8]`. Needs patching to `npx -y @google/gemini-cli -p ... -y` to match speckit-ralph's recent CLI integration `[transcript:711d1ee0-e054-4566-9d11-ef8ef9673820]`.
- **TTL Authoring Loop**: Ontology additions currently require Claude sessions. Smallest concrete change: A dedicated `tools/repo-state/reconcile/briefs/ontostar-authoring.yaml` brief to ingest natural-language domain needs and output `https://zoela.org/ontology/` namespaced TTL files.
- **ggen sync execution & remediation**: `ggen sync` runs manually by Claude `[transcript:ecaa7798-621a-44dc-ab39-2dd04b553c35]`. Smallest concrete change: A cron loop driver (e.g., `bash tools/ggen-sync-loop.sh`) that pipes `pnpm validate:all` and `ggen sync` stderr into a Gemini remediation brief when they fail.
- **Conformance Feedback Loop**: `mcpp ocel replay` and truex-kernel output `[memory:project_mcpp_truex-kernel_boundary]` are read by Claude. Smallest concrete change: A script extracting fitness/precision metrics from `bench_data/ocel20_example.jsonocel` `[snapshot:truex-kernel]` and routing them to Gemini via `gemini-do.sh` to self-correct the TTL/SPARQL mismatch.

## 4. Dependencies and blockers

- **npx @google/gemini-cli reachability**: Required across open-ontologies. Must use `-y` (or `--yolo`) flags compatibly `[transcript:711d1ee0-e054-4566-9d11-ef8ef9673820]`.
- **speckit-ralph/adapters/open-ontologies.sh**: Exists as a 44-line adapter implementing the 4-verb contract `[transcript:85ddf8ec-3a54-4586-ac70-34108c20d457]`. Must be the canonical orchestrator entry point.
- **.portfolio/tools/gemini-do.sh**: Defines `PR_RALPH_GEMINI_PRIMARY_MODEL` as `gemini-3.1-flash-lite-preview` and fallback as `gemini-3-flash-preview` `[transcript:85ddf8ec-3a54-4586-ac70-34108c20d457]`. Needs to be reachable when open-ontologies delegates tasks.
- **BLAKE3 Chain-Receipt Schema**: Open-ontologies `VerifyWorker` and `.ggen/receipts` use EARL/BLAKE3 `[snapshot:open-ontologies]`, `[transcript:ec324c5f-7e29-477c-b1bb-c394f10654d8]`. The receipt discipline must remain unbroken to pass `make adversarial`.

## 5. Proposed sequence

1. **[unblocks:npx] Patch subprocess invocations**  
...
```

*(Plus 69 other markdown files)*
