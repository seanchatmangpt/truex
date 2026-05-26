# Experimental Project Report: full-stack-rubric

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/full-stack-rubric`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `full-stack-rubric/my-app/package.json`
- `full-stack-rubric/package.json`
- `full-stack-rubric/scripts/deploy.sh`
- `full-stack-rubric/scripts/migrate-framework-imports.sh`
- `full-stack-rubric/vendors/nuxt-bdd/package.json`

## 3. Extracted Documentation & Context
### Source: `full-stack-rubric/CLAUDE.md`
```markdown
# Claude Code Configuration - SPARC Development Environment

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
  Task("Todo agent", "Refill todos...", "mesh-coordinator")
```

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 File Organization Rules

...
```

### Source: `full-stack-rubric/PRD.md`
```markdown
Of course. I will refactor the project structure to follow the more detailed pattern you've provided, which is characteristic of a production-grade Nuxt UI Pro Docs template.

The structure below represents the cookbook-site portion of our project, now organized with the source code inside an app/ directory and config files at the root. The mock-api/ server would be a sibling directory to this structure in the complete monorepo.

"Cracking the Qualia Interview" Project Structure (Revised)
Here is the complete project structure, applying the requested pattern to our cookbook content.

.
├── app/
│   ├── app.config.ts         # Nuxt UI Pro theme configuration
│   ├── app.vue               # Main Vue application entry point
│   ├── assets/
│   │   └── css/
│   │       └── main.css      # Global styles
│   ├── components/
│   │   ├── AppFooter.vue       # Shared site footer
│   │   ├── AppHeader.vue       # Shared site header with navigation
│   │   ├── AppLogo.vue
│   │   └── content/            # Components for use inside Markdown
│   │       ├── Callout.vue
│   │       └── PatternCard.vue
│   ├── error.vue               # Nuxt error page
│   ├── layouts/
│   │   └── docs.vue            # Layout for all documentation pages
│   └── pages/
│       ├── [...slug].vue       # Catch-all route to render /content pages
│       └── index.vue           # The site homepage
├── content/
│   ├── 1.rubric/
│   │   ├── 1.index.md
│   │   ├── 2.technical-skills.md
│   │   ├── 3.problem-solving.md
│   │   └── 4.communication.md
│   ├── 2.patterns/
│   │   ├── 1.backend/
│   │   │   ├── 1.index.md
│   │   │   ├── 2.filter-by-status.md
│   │   │   ├── 3.paginate.md
│   │   │   ├── 4.sort-by.md
│   │   │   └── 5.cache-read.md
...
```

### Source: `full-stack-rubric/README.md`
```markdown
# Nuxt Docs Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to build your own documentation with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://docs-template.nuxt.dev/)
- [Documentation](https://ui4.nuxt.com/docs/getting-started/installation)

<a href="https://docs-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui4.nuxt.com/assets/templates/nuxt/docs-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui4.nuxt.com/assets/templates/nuxt/docs-light.png">
    <img alt="Nuxt Docs Template" src="https://ui4.nuxt.com/assets/templates/nuxt/docs-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npx nuxi init -t github:nuxt-ui-templates/docs
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fdocs)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
...
```

*(Plus 63 other markdown files)*
