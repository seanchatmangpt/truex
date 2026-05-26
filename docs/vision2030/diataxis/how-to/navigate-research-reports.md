# How-To: Navigate and Extract Research Patterns

> **Objective:** Practical techniques, commands, and strategies for querying the 100 historical reports and extracting architectural patterns when building new TrueX features.

When developing new capabilities for TrueX, your first step should always be consulting the corpus. If you have an idea, there is a 99% chance it was attempted in one of the 95 experimental repositories.

## 1. How to Query the Corpus via CLI

The experimental reports are stored in `docs/vision2030/experimental-reports/`. Use these commands to perform deep research:

**Find all projects that attempted to use OpenTelemetry (OTEL):**
```bash
grep -il "opentelemetry\|otel" /Users/sac/truex/docs/vision2030/experimental-reports/*.md
```

**Find all projects that relied on Supabase or Postgres:**
```bash
grep -il "supabase\|postgres\|sql" /Users/sac/truex/docs/vision2030/experimental-reports/*.md
```

**Find projects with Python execution environments:**
```bash
grep -i "requirements.txt\|pyproject.toml" /Users/sac/truex/docs/vision2030/experimental-reports/*.md
```

## 2. How to Trace a Legacy Architecture

If you need to understand how a legacy piece of software was built (e.g., `zoela` or `unrdf`):
1. **Locate the Report:** Find `unrdf.report.md`.
2. **Find the Entry Point:** Look under `## 2. Executable Entry Points`. You might see `Makefile` or `scripts/start.sh`.
3. **Analyze the Raw Code:** Now that you know the entry point, use the `read_file` or `grep_search` tools against the actual `/Users/sac/unrdf/` directory. Target the entry point to trace the execution flow.

## 3. How to Apply the TrueX Filter

When you find a legacy pattern you want to reuse, you must pass it through the **TrueX Filter**:
* **Is it Prose?** If the legacy code uses strings for state (e.g., `status = "pending"`), you must convert it to a Semantic Bit (`Status8::PENDING`).
* **Is it an Oracle?** If the legacy code calls `openai.createCompletion`, you must convert it to a Compiled Cognition function or a strict GGEN manufacturing step.
* **Is it un-receipted?** If the legacy code modifies a database directly, you must wrap it in a `yield_receipt()` boundary.

## 4. How to Update a Report
If you deep-dive into a repository and discover a new architectural lesson that the automated script missed, open the report in `docs/vision2030/experimental-reports/` and manually append your findings under a new `## 4. Manual Audit Findings` section.