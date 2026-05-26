# Experimental Project Report: dogturk

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/dogturk`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `dogturk/package.json`
- `dogturk/scripts/setup-weaver-integration.sh`
- `dogturk/test/features/package.json`

## 3. Extracted Documentation & Context
### Source: `dogturk/CLAUDE.md`
```markdown
# Claude Code Configuration - DogTurk Development Environment

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**
```javascript
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("Research agent", "Analyze requirements and patterns...", "researcher")
  Task("Coder agent", "Implement core features...", "coder")
  Task("Tester agent", "Create comprehensive tests...", "tester")
  Task("Reviewer agent", "Review code quality...", "reviewer")
  Task("Architect agent", "Design system architecture...", "system-architect")
```

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 DogTurk Project Organization Rules

**NEVER save to root folder. Use these DogTurk-specific directories:**
...
```

### Source: `dogturk/DOGTURK-WEAVER.md`
```markdown
Here’s the planet-scale implementation of your GA-JS thesis using your JS/Erlang autonomic stack. Happy path. No error handling. JS-only at the edge. OTP in the core.

0) Objectives

Ontology-native MAPE-K loop that rewrites, validates, and hot-swaps code.

Receipts-native proofs for every adaptation.

Nuxt/Nitro surfaces, OTP schedulers, Ollama local AI, Hookable pipelines, OTel feedback.

Autonomic Gain (G_A) measured and published.

1) Repo layout
ga-js/
  ontology/
    core.ttl
    shapes.shacl.ttl
    telemetry.ttl
  scripts/
    build-schemas.js        # SHACL -> Zod (subset)
    weave.js                # templates -> routes/pipelines/tests
  packages/
    receipts/
      spec.json
      sign.js
    otel/
      tracer.js
    mape/
      monitor.js
      analyze.js
      generate.js
      validate.js
      evolve.js
      knowledge.js
  apps/edge/nuxt/
    server/api/mape/*.post.js
    server/api/receipts/ingest.post.js
    server/api/kpi/snapshot.post.js
    server/middleware/otel.js
    composables/useAutonomic.js
...
```

### Source: `dogturk/PRD-ARD.md`
```markdown
npm i -D citty n3 rdf-validate-shacl zod ai
npm i -D ollama-ai-provider-v2
Citty is the UnJS CLI builder. N3 parses RDF/TTL. rdf-validate-shacl validates in JS. Vercel AI SDK “agents + tools” run locally with Ollama. 
GitHub
+2
GitHub
+2
npm
AI SDK

cli/ga.js — Citty commands that close the GA loop
js
Copy code
#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { Parser as N3Parser } from 'n3'
import { Validator } from 'rdf-validate-shacl'
import { z } from 'zod'
import fs from 'node:fs/promises'
import { generateText, tool } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'
import { spawnSync } from 'node:child_process'

/* ---------- helpers ---------- */
const ollama = createOllama({ host:'http://127.0.0.1:11434', model:'qwen2.5-coder' })

async function read(url){ return fetch(url).then(r=>r.text()) }
function shaclToZod(shacl){
  const lines = shacl.split('\n'); const f=[]
  for(const l of lines){
    if(l.includes('sh:path')){ const k=l.split('sh:path')[1].match(/[:A-Za-z0-9_]+/)[0].split(':').pop(); f.push({k}) }
    if(l.includes('sh:in')) f[f.length-1].enum=(l.match(/\("([^"]+)"(?:\s+"[^"]+")*\)/)||[''])[0]
    if(l.includes('xsd:anyURI')) f[f.length-1].type='url'
    if(l.includes('xsd:string')) f[f.length-1].type='string'
  }
  const body=f.map(x=> x.enum
    ? `  ${x.k}: z.enum(${JSON.stringify(x.enum.replace(/[()"]/g,'').split(/\s+/))})`
    : x.type==='url' ? `  ${x.k}: z.string().url()` : `  ${x.k}: z.string()`).join(',\n')
  return `import { z } from 'zod'\nexport const NodeShape = z.object({\n${body}\n})\n`
}
...
```

*(Plus 106 other markdown files)*
