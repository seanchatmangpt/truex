# External Doctest Runner Implementation Report (Gall S5)

This report documents the implementation of the Truex-native external doctest verifier at `scripts/docs/verify-doctests.ts` and its integration with the Doctor Agent and CLI.

---

## 1. Implementation Overview

The external doctest verifier is a robust tool designed to scan markdown files and JSDoc comments inside JS/TS source files, extract code blocks annotated for testing, rewrite import paths, run them in Vitest, and report findings via JSON and Markdown reports.

It is implemented as a standalone script at `scripts/docs/verify-doctests.ts` and integrated directly into the `truex` CLI via `npx tsx scripts/truex.ts doctor prove doctest`.

---

## 2. Design and Architecture

### A. Scanning Strategy
The tool scans:
- All `.md` files recursively in the `docs` folder.
- `README.md` and `walkthrough.md` in the workspace root if they exist.
- TS/JS source files (`src/**/*.ts`, `src/**/*.js`, and `packages/**/src/**/*.ts`, `packages/**/src/**/*.js`).

### B. Robust JSDoc & Markdown Code Block Parsing
- **Markdown Parsing:** Scans for fenced blocks beginning with ` ```ts doctest `, ` ```typescript doctest `, or ` ```bash doctest `. It parses optional attributes like `name="foo"` from the opening fence.
- **JSDoc Parsing:** A line-by-line state machine extracts `/** ... */` comments and maps lines back to their original file line numbers.
- **Prefix Cleaning:** For JSDoc, it cleans standard JSDoc line prefixes (`* ` and leading spaces) using `l.text.replace(/^\s*\*\s?/, '')` to preserve indentation of inner code blocks before running the markdown parser on the cleaned content.
- **Ignore / Defer Handling:** Any code block containing `no-doctest` or `example-only` is skipped. Blocks containing `defer-doctest`, `deferred`, or `todo-doctest` are marked as deferred.

### C. Relative and Absolute-Like Import Path Rewriting
To allow generated files in `.generated/doctests/` to resolve imports successfully:
- Top-level `import` statements are extracted using regex and written to the top of the generated file (outside the `describe` / `it` wrapper block).
- Imports starting with relative paths (`./` or `../`) are resolved relative to the original file's parent folder and rewritten relative to `.generated/doctests/`.
- Imports starting with `src/` or `packages/` are resolved relative to the workspace root and rewritten relative to `.generated/doctests/`.
- Helper imports (`describe`, `it`, `expect` from `vitest`) are automatically prepended, while any duplicate `vitest` imports from the original code block are stripped to avoid conflicts.
- Code blocks are wrapped inside `async () => { ... }` within an `it(...)` test block to support top-level `await`.

### D. Bash Doctest Execution & Sandboxing
- Bash blocks are parsed line-by-line to extract the first executable command and expectation comments like `# expect: exitCode 0` or `# expect: stdout "..."`.
- Execution is strictly limited to allowlisted commands:
  - `npx tsx scripts/truex.ts doctor prove hook`
  - `npx tsx scripts/truex.ts doctor prove replay`
  - `npx tsx scripts/truex.ts doctor prove doctest`
- A Vitest test file is generated for each bash doctest which invokes the command via `execSync` with output buffering, and asserts on the exit code, stdout, and stderr, unifying execution under Vitest.

### E. Vitest Report Aggregation
- Active doctests are run collectively:
  `npx vitest run .generated/doctests --reporter=json --outputFile=.generated/doctest-results.json`
- The results are read back and mapped to original source files, names, and line numbers.
- If there are no active doctests, the Vitest runner is bypassed to prevent empty directory errors.

---

## 3. Reporting Artifacts

The tool outputs reports to:
1. **JSON Report:** `docs/reports/doctest-examples.report.json`
2. **Markdown Report:** `docs/reports/doctest-examples.report.md`

---

## 4. Verification and CLI Integration

- Added a `doctest` case to `DoctorAgent.prove(primitive)` (`agents/doctor/agent.ts`) which spawns the verifier script.
- Added a `doctest` subcommand to `truex doctor prove` (`scripts/truex.ts`).

### Sample Test Case
Created a test file `docs/doctest-sample.md` containing:
- A TypeScript doctest asserting `hash` length.
- A Bash doctest executing `npx tsx scripts/truex.ts doctor prove hook`.
- An ignored block.
- A deferred block.

### CLI Test Execution
Command: `npx tsx scripts/truex.ts doctor prove doctest`
Output:
- Found 266 files to inspect.
- Extracted 4 total doctest blocks (2 active, 1 skipped, 1 deferred).
- Generated 2 active test files under `.generated/doctests/`.
- Executed Vitest: All 2 tests passed successfully.
- Generated reports in `docs/reports/`.
