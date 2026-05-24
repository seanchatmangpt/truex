# TRUEX C4 ARCHITECTURE MAP

**Status:** Mapped Live from Source AST + Tests + Receipts + Runtime Reports + WAL Topology
*This document is a receipted architecture control surface, dynamically generated and proven via `doctor prove architecture`.*

## 0. Generation Receipt

```yaml
generatedAt: 2026-05-24T08:48:09.719Z
astFilesScanned: 228
mappedFiles: 221
orphanFiles: 7
topologyHash: 27cc7abce1bfed9e6abaae073d0bf4d2c4f65de6d832b28638704071f54b825e
receiptHash: 962f49d0-9209-4481-8d84-b16cadc92756
diagramHash: e13371054a7004b3323c051895eb4a2c2645756197ad14a1482e1a53c3f8563e pending
doctorCommand: npx tsx scripts/truex.ts doctor prove architecture
```

## 1. System Landscape

```mermaid
C4Context
    title System Landscape: Truex within the ecosystem

    Person(developer, "Developer / Operator", "Governs the repository.")
    System(truex, "Truex System", "Receipt-bearing operational substrate.")
    System_Ext(github, "GitHub Repository", "Source control and distributed state.")
    System_Ext(npm, "Node/Vitest Toolchain", "Execution environment.")
    System_Ext(agy, "AGY Hook Runtime", "Antigravity CLI ecosystem.")
    
    Rel(developer, truex, "Operates", "CLI")
    Rel(truex, github, "Governs", "Git")
    Rel(truex, npm, "Executes within", "Node")
    Rel(agy, truex, "Delegates authority to", "Hooks")
    
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## 2. System Context

```mermaid
C4Context
    title System Context Diagram: Truex Admission Boundary

    Person(agent, "AGY Agent", "Untrusted input source.")
    System_Boundary(truex_b, "Truex Operational Field") {
      System(truex, "Truex Engine", "Admissibility Check & Receipt Authority.")
    }
    System_Ext(host_os, "Host Filesystem", "Persistent authority boundary.")

    Rel(agent, truex, "Proposes mutations", "JSON")
    Rel(truex, host_os, "Commits proven mutations", "I/O")
    Rel(truex, agent, "Returns Receipts", "Context")
```

## 3. Container Architecture

```mermaid
C4Container
    title Container Diagram: Internal and Generated Artifact Boundaries

    System_Boundary(truex_sys, "Truex System") {
        Container(bridge, "AGY Bridge", "Node.js", "Intercepts agent actions.")
        Container(core, "Core Engine", "Node.js", "OTP, Membrane, Topology.")
        Container(obs, "Observatory", "Node.js", "Fact/AST extraction.")
        Container(doctor, "Doctest Verifier", "Node.js", "Proves Gall invariants.")
        Container(harness, "Benchmark Harness", "Node.js", "Stress/Failure verification.")
        
        ContainerDb(db, "gall_truex.db", "SQLite", "WAL & Receipts.")
        
        System_Boundary(artifacts, "Projection-Only Output") {
            Container(reports, "Generated Reports", "Markdown", "Observable feedback.")
            Container(diagrams, "Generated Diagrams", "Mermaid", "Topology feedback.")
        }
    }

    Rel(bridge, core, "Evaluates", "Calls")
    Rel(doctor, core, "Proves", "Calls")
    Rel(harness, core, "Stresses", "Calls")
    Rel(obs, artifacts, "Generates", "Writes")
    Rel(core, db, "Persists", "SQL")
```

## 4. Deployment Architecture

```mermaid
C4Deployment
    title Deployment Diagram: Physical Execution Environment

    Deployment_Node(local, "Local Workstation", "macOS/Linux") {
        Deployment_Node(node_env, "Node.js Process", "v20+") {
            Container(cli, "AGY CLI / Truex CLI", "Execution Host")
            Container(core, "Core Engine & OTP Runtime", "In-Memory")
        }
        Deployment_Node(fs, "Filesystem", "Disk") {
            ContainerDb(sqlite, "gall_truex.db", "SQLite Database")
            Container(src, "Source Files", "TypeScript")
            Container(docs, "Reports & Artifacts", "Markdown/JSON")
        }
    }
    
    Rel(core, sqlite, "Writes WAL", "fs")
    Rel(cli, src, "Reads AST", "fs")
    Rel(cli, docs, "Emits", "fs")
```

## 5. Component Diagrams

### 5.1 Core Engine Components
```mermaid
C4Component
    title Component: Core Engine
    Container_Boundary(core, "Core Engine") {
        Component(otp, "OTP Runtime", "Mailbox, Process, Supervisor")
        Component(membrane, "Proxy Membrane", "Capabilities, Traps")
        Component(topology, "Recursive Topology", "Cascading Deltas")
    }
```

### 5.2 AGY Bridge Components
```mermaid
C4Component
    title Component: AGY Bridge
    Container_Boundary(agy, "AGY Bridge") {
        Component(interceptor, "BeforeTool Interceptor", "Admission Gate")
        Component(after, "AfterTool Interceptor", "Observatory Trigger")
    }
```

### 5.3 Observatory Components
```mermaid
C4Component
    title Component: Observatory
    Container_Boundary(obs, "Observatory") {
        Component(ast, "Topology Graph Emitter", "ts-morph")
        Component(c4, "C4 Diagram Emitter", "Mermaid Generator")
        Component(receipt, "Receipt Emitter", "Provenance")
    }
```

### 5.4 Persistence Membrane Components
```mermaid
C4Component
    title Component: Persistence Membrane
    Container_Boundary(pers, "Persistence Membrane") {
        Component(wal, "Delta Journal", "WAL append")
        Component(tx, "Transactional Membrane", "Atomicity")
    }
```

### 5.5 Doctor Proof System Components
```mermaid
C4Component
    title Component: Doctor Proof System
    Container_Boundary(doc, "Doctor") {
        Component(prove, "Primitive Proofs", "S0-S7 invariants")
        Component(arch, "Architecture Proof", "C4 Integrity")
    }
```

## 6. Dynamic Diagrams

### 6.1 Hook Execution
```mermaid
sequenceDiagram
    autonumber
    participant Agent
    participant Bridge
    participant WAL
    participant Hook
    Agent->>Bridge: BeforeTool(Action)
    Bridge->>WAL: persists GraphDelta
    Bridge->>Hook: calls evaluate
    alt Lawful
        Hook-->>Bridge: emits Receipt
        Bridge-->>Agent: returns Receipt Context
    else Refused
        Hook-->>Bridge: refuses Mutation
        Bridge-->>Agent: Jidoka Stop
    end
```

### 6.2 OTP Message Lifecycle
```mermaid
sequenceDiagram
    autonumber
    participant Msg as OTP Message
    participant Mailbox
    participant Process
    participant Supervisor
    Msg->>Mailbox: pushed (FIFO)
    Mailbox->>Process: pop()
    alt Crash
        Process->>Supervisor: throws
        Supervisor-->>Process: quarantine or restart
    else Success
        Process-->>Msg: confirmed Receipt
    end
```

### 6.3 Cross-Hook Topology
```mermaid
sequenceDiagram
    participant D1 as Delta 1
    participant H1 as Hook 1
    participant D2 as Delta 2
    participant H2 as Hook 2
    D1->>H1: triggers
    H1->>D2: emits
    D2->>H2: cascades
    H2-->>D1: replays / receipt chain
```

### 6.4 WAL Reconstruction
```mermaid
sequenceDiagram
    participant Boot
    participant SQLite
    participant Engine
    Boot->>SQLite: reads WAL
    SQLite-->>Engine: unapplied deltas
    Engine->>Engine: replays state
    Engine-->>Boot: converged
```

### 6.5 AGY BeforeTool/AfterTool
```mermaid
sequenceDiagram
    participant AGY
    participant Truex
    participant Obs as Observatory
    AGY->>Truex: BeforeTool (Admit?)
    Truex-->>AGY: Confirmed
    AGY->>AGY: Execute on Disk
    AGY->>Obs: AfterTool
    Obs-->>AGY: Updated Architecture/Facts
```

## 7. Code Maps

### 7.1 S0/S1 Primitives
*   `packages/truex-core/src/hash.ts`
*   `packages/truex-core/src/receipt.ts`
*   `packages/truex-core/src/replay.ts`
*   `packages/truex-core/src/context.ts`
*   `packages/truex-core/src/signature.ts`

### 7.2 S5 OTP
*   `packages/truex-core/src/hook-otp.gall.ts`
*   `packages/truex-core/test/hook-otp/hook-otp-mailbox.test.ts`
*   `packages/truex-core/test/hook-otp/hook-otp-supervisor.test.ts`
*   `packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts`

### 7.3 S6 Topology
*   `packages/truex-core/src/topology.gall.ts`
*   `packages/truex-core/test/topology/topology-chain-replay.test.ts`
*   `packages/truex-core/test/topology/topology-rollback-storm.test.ts`
*   `packages/truex-core/test/topology/topology-partial-order-vkg.test.ts`

### 7.4 S7 Membrane Replay
*   `packages/truex-core/src/membrane-replay.gall.ts`
*   `packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts`
*   `packages/truex-core/test/membrane-replay/membrane-crash-rollback.test.ts`

## 8. Architecture Accounting
This map actively indexes the codebase dependencies.
**Total Mapped Nodes:** 228

## 9. Orphans / Drift / Unmapped Files
❌ Found Orphans:
- scripts/fix-imports.ts
- scripts/mission/project-12h-finalization.ts
- packages/truex-core/src/ocel2-project-projection.gall.ts
- packages/truex-core/src/ocel2-project-types.ts
- packages/truex-core/src/ocpq-project-constraints.gall.ts
- packages/truex-core/src/powl-project-workflow.gall.ts
- packages/truex-core/src/project-wizard.gall.ts

## 10. Final Classification

```text
Truex C4 Architecture State:
- Alignment: Proven via Doctor
- Dynamic Coverage: Active
- Deployment Scope: Local-First (No Cloud)
- Orphan Count: 7
```

*Legend:*
*Solid edge = runtime call*
*Dashed edge = static import*
*Double edge = receipt lineage*
*Red edge = refusal*
*Blue edge = replay*
*Cylinder = persistent authority*