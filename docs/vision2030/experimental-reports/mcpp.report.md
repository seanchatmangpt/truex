# Experimental Project Report: mcpp

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/mcpp`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `mcpp/Makefile`
- `mcpp/scripts/aat-live-gate.sh`
- `mcpp/scripts/andon-namespace-lint.sh`
- `mcpp/scripts/bench-baseline-capture.sh`
- `mcpp/scripts/bench-gate.sh`
- `mcpp/scripts/build-atomvm-fixture.sh`
- `mcpp/scripts/check-k-p09-concurrent.sh`
- `mcpp/scripts/gemini-invoke.sh`
- `mcpp/scripts/healthcare-doctrine-lint.sh`
- `mcpp/scripts/k-p09-no-fake-admit.sh`
- `mcpp/scripts/parts-build.sh`
- `mcpp/scripts/parts-publish.sh`
- `mcpp/scripts/port-of-la-evidence.sh`
- `mcpp/scripts/templates-sorted-loops.sh`
- `mcpp/scripts/web3-naming-lint.sh`
- `mcpp/vscode-mcpp/package.json`

## 3. Extracted Documentation & Context
### Source: `mcpp/ADMISSIONS_AND_FACULTY.md`
```markdown
# ASECR Ph.D. Program: Admissions and Faculty Charter

## 1. Admissions Philosophy and Prerequisites

The Ph.D. in Autonomic Systems Engineering and Civic Resilience (ASECR) sits at the intersection of high-speed computational engineering and social science. Because very few candidates possess native fluency in both WebAssembly compilation and labor economics, our admissions process selects for "T-shaped" researchers: deep expertise in one domain, with the capacity to bridge to the other.

### 1.1 Candidate Profiles
We recruit from two primary pools:
*   **The Systems Track:** Candidates with backgrounds in Systems Programming (Rust/C++), Cryptography, Formal Verification, or Distributed Systems.
*   **The Sociotechnical Track:** Candidates with backgrounds in Labor Economics, Sociology, Public Policy, or Technology Law, who possess demonstrably strong quantitative and computational foundations.

### 1.2 The "Bridge Semester" (Semester 0)
Admitted students must complete an intensive summer "Bridge Semester" before Year 1 begins. This standardizes the cohort.
*   **For Sociotechnical Candidates:** *Intensive Rust and Systems Substrates.* Focuses on memory safety, WASM compilation, and the basics of cryptographic hashing (BLAKE3).
*   **For Systems Candidates:** *Quantitative Social Science and Public Policy.* Focuses on labor displacement economics, ethnographic methods, and the history of institutional trust.

## 2. Faculty and Mentorship Structure

To prevent the socio-technical layers (L7) from devolving into an afterthought, or the computational layers (L4/L6) from becoming merely theoretical, the ASECR program mandates a strict **Dual-Advising Structure**.

### 2.1 The Dual-Advisory Committee
Every Ph.D. candidate must have two primary advisors:
1.  **Technical Advisor:** A faculty member from the Systems Engineering, Cryptography, or Formal Logic departments. Responsible for ensuring the artifact achieves TRL 7-9 and passes Bounded Model Checking standards.
2.  **Sociotechnical Advisor:** A faculty member from Economics, Sociology, Law, or Public Policy. Responsible for ensuring the deployment modeling is rigorously grounded in social science literature and addresses real-world civic resilience.

### 2.2 Core Faculty Disciplines Required
The Institute maintains faculty lines in the following disciplines:
*   **Process Mining and Evidence:** Experts in OCEL 2.0 and streaming analytics.
*   **Admissibility and Logic:** Researchers from the Proof-Carrying Code and Constraint Answer Set Programming (sCASP) communities.
*   **Civic Infrastructure:** Sociologists studying local provision networks (e.g., congregations, mutual aid) and economists focusing on automation displacement.
*   **Technology Law:** Legal scholars focusing on algorithmic liability and autonomic accountability.
...
```

### Source: `mcpp/CASE_STUDIES_AND_EXERCISES.md`
```markdown
# ASECR Ph.D. Program: Case Studies and Practical Exercises

This document details the analytic case studies and hands-on computational exercises utilized in the **Ph.D. in Autonomic Systems Engineering and Civic Resilience (ASECR)**. These materials are designed to bridge the 7-Layer Braided Stack—from Proof-Carrying Code (L4) and Bounded Logic (L5) to Civic Provision Networks (L7).

---

## Part 1: Analytic Case Studies

These case studies are evaluated using Yin's (2018) methodology for replication logic and evidence triangulation. They train students to deploy deterministic orchestration within complex sociotechnical and civic realities.

### Case Study A: The Port of Los Angeles Container Release Protocol
**Layer Mapping:** L2 (Process Evidence), L4 (Admissibility)
**Context:** An LLM-based logistics orchestrator is responsible for releasing cargo containers. Historically, the LLM hallucinated authorization codes under high load, causing illegal releases without audit trails.
**The Scenario:** The port authority mandates an MCPP-style "Blue River Dam." The LLM may *suggest* a release, but the `Blue River Dam` intercepts the command.
**The Analysis Task:** 
1. Map the required OCEL 2.0 object interactions (Vessel, Container, Customs_Agent, Truck).
2. Design the 14-artifact cryptographic proof chain that must be generated before the physical gate receives the `Verdict::Accept` signal.
3. Analyze the fallout: If the Ed25519 signature fails verification at the gate, how does the system generate a structurally sound refusal (`AndonReason`) without crashing the supervised actor topology?

### Case Study B: The Healthcare Adverse Drug Event (ADE) Network
**Layer Mapping:** L3 (Route Law), L5 (Bounded Logic)
**Context:** A cross-enterprise healthcare network utilizes an automated agent to analyze patient histories and prescribe countermeasures for Adverse Drug Events (ADEs).
**The Scenario:** The agent must abide by strict ODRL (Open Digital Rights Language) data privacy obligations. The LLM attempts to broadcast sensitive patient data to a third-party diagnostic API, violating the ODRL constraint.
**The Analysis Task:**
1. Use POWL (Partially Ordered Workflow Language) to model the prescriptive route.
2. Explain how the bounded logic engine (Prolog8/sCASP) preemptively calculates counterfactuals to prove the ODRL violation *before* execution.
3. Design the `IntentPacket` emitted by the Eve Autonomic Instinct engine that flags this as an `ExceptionHandling` intent rather than a standard `RouteDiscovery` intent.

### Case Study C: Automation Displacement and the Congregational Provision Network
**Layer Mapping:** L7 (Civic Deployment), L6 (High-Speed Kernels)
**Context:** Widespread deployment of robotic automation in a mid-western manufacturing hub has displaced 40% of the local workforce (Acemoglu & Restrepo, 2020). The state welfare apparatus is overwhelmed.
**The Scenario:** A network of 15 local churches and community centers steps in to manage a decentralized food and medical supply chain (Chaves & Tsitsos, 2001). They operate on low-power, donated edge devices.
**The Analysis Task:**
1. Justify the compilation of the supply-chain orchestration logic into WebAssembly (wasm4pm) for execution on low-resource edge nodes.
2. Detail how cryptographic receipts (BLAKE3) generated by the MCPP orchestrator replace the need for an expensive, centralized, high-trust banking infrastructure among the volunteer nodes.
3. Write a sociotechnical brief on how cryptographic admissibility and process evidence (OCEL 2.0) generate *institutional trust* in fragile civic environments.

---

## Part 2: Practical Computational Exercises
...
```

### Source: `mcpp/CHANGELOG.md`
```markdown
# CHANGELOG

## v26.5.19 — Gap-fill campaign: documentation + QoL + DX + correctness (2026-05-16)

- **docs**: Diátaxis restructuring (tutorials, how-tos, reference, explanation)
- **docs**: 8 new tutorial/howto/reference files (4,199 lines)
- **fix**: probe count corrections (18→19 in 8 files)
- **fix**: compile.rs M2 route discovery + WASM sentinel
- **fix**: error message context improvements (5 CLI verbs)
- **fix(dx)**: --help text + completions coverage
- **fix(perf)**: chain.rs lazy O(1) receipt_id index (TODO V2 resolved)
- **test**: +50 unit tests for mcpp-route-viz (4→72 tests)
- **docs**: markdown audit + archive (75 files reviewed, 16 archived)

## v26.5.19 — Slice κ: Cross-Runtime AAT-Live + Dry-Run Published (THE GOAL)

### Summary

The v26.5.19 goal: AAT-Live validated across MCP / A2A / POWL v2 /
AtomVM / Erlang in a **single trace**, with the release report
published as a permanent reviewer artifact (commit `b14fcb9`).

19 AAT families pass (105 blocked, 0 escaped, 0 inconclusive, 0
unauthorized_skips, 37 supported_skips). `mcpp aat verify --require_live
true` returns `status=ok` with both `launch_verdict` and
`live_runtime_verdict` Accepted.

### κ.1 New AAT family — `CROSSRT` (10 probes X01..X10)

- `crates/mcpp-server/src/aat/orchestrator/cross_runtime/{mod,tests}.rs`
  — `CrossRuntimeFamily` reads the existing live trace and correlates
  the five runtime layers into ten integration probes:
  - **X01 mcp_layer_validated** — `mcp.tool_call` present.
  - **X02 a2a_layer_validated** — `a2a.message` / relay_send present.
  - **X03 powl_v2_layer_validated** — `powl.activity.enabled` precedes
    every `powl.route.evaluate`.
  - **X04 atomvm_layer_validated** — `atomvm.actor.spawn` present (real
    path); SupportedSkip with `evidence_ref` on hosts without AtomVM.
  - **X05 erlang_layer_validated** — `erlang.actor.spawn` present;
    SupportedSkip when `rebar3`/`erl` absent on host.
...
```

*(Plus 62 other markdown files)*
