# Tutorial: Extracting Primitives from the Experimental Corpus

> **Objective:** Learn how to physically extract a failed concept from a historical repository and rebuild it as a mathematically proven primitive in the TrueX substrate.

Welcome to the TrueX Experimental Corpus. You are standing on 30 billion tokens of research across 95 repositories. This tutorial walks you through the lifecycle of analyzing "dark matter" and transforming it into Vision 2030 architecture.

## Step 1: The Mindset Shift
When you open a project like `mcpp` or `unrdf`, you will see failing tests, messy code, and abandoned dependencies. **Do not try to fix the code.** 
The code is dead. The *boundary condition* it hit is immortal.
Ask yourself: *What forced this project to be abandoned?*
* Was it too slow? (Latency boundary)
* Did it hallucinate? (Determinism boundary)
* Was it un-auditable? (Provenance boundary)

## Step 2: Locating the Failure
Let’s say we want to build a new networking protocol for agents. 
1. Open the **[Project Catalog](../reference/project-catalog.md)**.
2. Locate `mcp_erl` or `mcp-mqtt-erl`.
3. Open its report file in `docs/vision2030/experimental-reports/`.
4. Read the `Executable Entry Points`. You'll notice they rely on heavy Erlang/OTP messaging.

## Step 3: Extracting the Intent
Read the extracted markdown in the report. In `mcpp`, you'll see the doctrine: *"work must follow a declared route, be admitted by authority, and emit receipts."* 
The *intent* was perfect. The *implementation* (a massive Erlang messaging fabric for LLM chat) was flawed because it didn't solve the LLM hallucination issue at the node level.

## Step 4: The Branchless Translation
Now, take that intent into TrueX.
Instead of rebuilding an Erlang messaging fabric, we map it to the Vision 2030 substrate:
* **The Route:** We use POWL v2 Choice Graphs (`powlv2lsp`).
* **The Admission:** We compile it into a branchless Rust predicate (`bcinr`).
* **The Receipt:** We emit an OpenTelemetry span hashed with BLAKE3.

## Summary
You have successfully extracted a concept. By finding the intent, identifying the boundary that killed the original project, and translating it to Tier 0 (Physics) or Tier 4 (Execution), you have evolved the ecosystem.