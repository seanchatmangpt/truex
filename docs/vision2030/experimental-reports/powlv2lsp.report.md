# Experimental Project Report: powlv2lsp

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/powlv2lsp`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `powlv2lsp/package.json`
- `powlv2lsp/recreate_paper.sh`
- `powlv2lsp/run_headless.sh`

## 3. Extracted Documentation & Context
### Source: `powlv2lsp/docs/diataxis/explanation.md`
```markdown
# Explanation: Choice Graphs and Partial Orders

POWL v2 (Partially Ordered Workflow Language) addresses the limitations of block-structured process trees by combining graph-based decisions with order-based concurrency.

## The Block-Structure Limitation
Standard Process Trees and BPMN often enforce strict "Split/Join" parity. If you split into branches A and B, you must join them at a single point. Real processes are often "messier" (non-block-structured).

## Choice Graphs
A Choice Graph represents an exclusive choice (XOR) but as a general directed acyclic graph (DAG).
- **Start/End Nodes**: Every Choice Graph must have a designated entry and exit.
- **Reachability**: Every node must be on a path from start to end.
- **Acyclicity**: Unlike loops, choice graphs themselves are acyclic to ensure termination within the structure.

## Partial Orders
Partial Orders handle concurrency (AND).
- **Ordering Constraints**: If A -> B in a Partial Order, A must finish before B starts.
- **Independence**: If no edge exists between A and C, they can run in any order or in parallel.

## Why this Ecosystem?
By using an LSP/MCP approach, we allow AGI to "reason" about these mathematical structures using the same tools a human uses in VS Code, ensuring that high-level process design remains grounded in formal correctness.

...
```

### Source: `powlv2lsp/docs/diataxis/how-to-bridge.md`
```markdown
# How-to: Bridge TypeScript LSP with Python Engine

This guide shows how to maintain the cross-language sync between the TS-based LSP and the Python `networkx`-backed reference engine.

## Problem
You want to ensure that a model designed in the DSL is mathematically sound according to the original paper's Python implementation.

## Solution: The Python Bridge
The `tests/bridge.py` script acts as the semantic link. It translates the TS JSON AST into real Python objects.

### 1. Adding a New Node Type
If you add a `Redo` node in TS:
1. Update `src/types.ts`.
2. Update `tests/bridge.py`'s `build_node` function:
   ```python
   elif ntype == 'redo':
       return RedoNode(do=build_node(data['do']), redo=build_node(data['redo']))
   ```

### 2. Manual Verification
You can pipe the JSON AST directly to the bridge:
```bash
node -e 'console.log(JSON.stringify(require("./samples/valid.json")))' | python3 tests/bridge.py
```

## Troubleshooting
- **ModuleNotFoundError**: Ensure `PYTHONPATH` includes the `vendors/` directory.
- **Recursion Error**: Check for circular references in your JSON AST; the bridge uses recursive descent.

...
```

### Source: `powlv2lsp/docs/diataxis/reference.md`
```markdown
# Reference: MCP Tooling API

This document defines the schema and expected behavior for the POWL MCP tools used in A2A workflows.

## `validate_powl`
Runs recursive structural validation using the TypeScript LSP logic.

### Parameters
- `content` (string): The raw POWL DSL string.

### Output
Returns a JSON array of `Diagnostic` objects.
```json
[
  {
    "severity": 1,
    "message": "Node X cannot reach the end node Y.",
    "source": "powl-v2-validator"
  }
]
```

## `python_verify`
Cross-validates the model by instantiating it in the reference Python engine.

### Parameters
- `content` (string): The raw POWL DSL string.

### Output
Returns the `pretty()` output from the Python model or a `FAILURE` traceback.

## `powl-expert` Subagent
- **Scope**: Inherits main model.
- **MCP Access**: Full access to `powl-mcp` and `pm4py-mcp`.
- **System Prompt**: Defined in `.gemini/subagents/powl-expert.json`.

...
```

*(Plus 1 other markdown files)*
