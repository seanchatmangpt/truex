# Experimental Project Report: wf

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/wf`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `wf/Makefile`
- `wf/src/Makefile`
- `wf/tests/e2e/Makefile`
- `wf/yaml-cloud/Makefile`

## 3. Extracted Documentation & Context
### Source: `wf/BEST-PRACTICES.md`
```markdown
Workflow Engine: Modern Go Best Practices
1. Project Layout (Monorepo-friendly)
/wf
  /cmd
    /wf            # CLI entrypoint (urfave/cli or cobra)
  /pkg
    /workflow      # Core workflow engine (interfaces, execution, patterns)
    /dsl           # YAML DSL parser
    /otel          # OpenTelemetry integration
    /event         # Event bus abstraction (Kafka, NATS, etc.)
    /storage       # Pluggable persistence (badger, postgres, etc.)
    /api           # gRPC/REST/GraphQL server
  /internal
    /executor      # Worker goroutines, scheduling, state mgmt
    /runtime       # Core loop, deadlines, tick mgmt
  /tests
    /integration   # Black-box end-to-end
  /examples
    /getting-started


cmd/: CLI apps, thin wiring only.

pkg/: Public packages with clean interfaces.

internal/: Private “engine room” no external consumers should touch.

tests/ + examples/: Learning + validation.

2. API Surface (for Go devs)

Idiomatic Go client API:

ctx := context.Background()
eng := workflow.NewEngine(workflow.Config{
    Storage: storage.NewPostgres(dsn),
    EventBus: event.NewNATS(natsURL),
    Tracer: otel.NewTracer("wf-engine"),
})

...
```

### Source: `wf/CERTIFICATION.md`
```markdown
# 🏆 yaml-cloud System Certification

**OFFICIAL CERTIFICATION DOCUMENT**

---

## 📋 Certification Summary

| **System** | yaml-cloud - Autonomic Backend Substrate |
|------------|-------------------------------------------|
| **Version** | 1.0.0 |
| **Assessment Date** | August 30, 2024 |
| **Certification Valid** | August 30, 2024 - November 30, 2024 |
| **Overall Compliance Score** | **87.3%** |
| **Certification Status** | **✅ CERTIFIED COMPLIANT** |
| **Production Ready** | **✅ APPROVED** |

---

## 🎯 Executive Certification Statement

**This document certifies that the yaml-cloud system has been thoroughly evaluated by Agent 16 - Documentation & Compliance Specialist and meets Google engineering standards, industry best practices, and production readiness requirements.**

The system demonstrates exceptional performance, strong security posture, comprehensive documentation, and operational excellence. With an overall compliance score of 87.3%, yaml-cloud exceeds the minimum certification threshold and is **APPROVED FOR PRODUCTION DEPLOYMENT**.

---

## 📊 Compliance Scorecard

### Core Compliance Metrics

| **Category** | **Score** | **Status** | **Badge** |
|--------------|-----------|------------|-----------|
| **Overall Compliance** | **87.3%** | ✅ **COMPLIANT** | 🏆 **CERTIFIED** |
| **Code Quality** | **91.2%** | ✅ **EXCELLENT** | 🥇 **GOLD STANDARD** |
| **Security** | **84.5%** | ✅ **COMPLIANT** | 🛡️ **SECURE** |
| **Performance** | **93.1%** | ✅ **EXCELLENT** | ⚡ **HIGH PERFORMANCE** |
| **Documentation** | **89.7%** | ✅ **COMPLIANT** | 📚 **WELL DOCUMENTED** |
| **Testing** | **78.9%** | ⚠️ **NEAR COMPLIANT** | 🧪 **TESTING READY** |
| **Operations** | **85.6%** | ✅ **COMPLIANT** | 🔧 **OPS READY** |
...
```

### Source: `wf/CLAUDE.md`
```markdown
# Claude Code Configuration - `yaml-cloud` Autonomic Substrate

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:

1.  ALL operations MUST be concurrent/parallel in a single message.
2.  **NEVER save working files, text/mds, and tests to the root folder**.
3.  ALWAYS organize files in the appropriate monorepo subdirectories.
4.  **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently.

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**

  * **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum).
  * **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions.
  * **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message.
  * **Bash commands**: ALWAYS batch ALL terminal operations in ONE message.
  * **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message.

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**

```go
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("API Contract Agent", "Define the Protobuf messages and gRPC services for the 'users' resource in api/proto/yc/v1/users.proto.", "system-architect")
  Task("Storage Agent", "Implement the SQLite storage logic for the 'users' resource in pkg/store/sqlite/users_store.go.", "coder")
  Task("API Server Agent", "Implement the gRPC server handlers for the 'users' resource in pkg/api/users_server.go.", "coder")
  Task("CLI Agent", "Create the 'yctl users create' and 'yctl users get' commands in cmd/yctl/commands/users.go.", "coder")
  Task("Build Agent", "Generate and refine the BUILD.bazel files for the new packages using Gazelle.", "cicd-engineer")
```

**MCP tools are ONLY for coordination setup:**

  * `mcp__claude-flow__swarm_init` - Initialize coordination topology.
  * `mcp__claude-flow__agent_spawn` - Define agent types for coordination.
  * `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows.
...
```

*(Plus 43 other markdown files)*
