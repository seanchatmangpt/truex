# truex migration plan v26.11.16

Standing: UNVERIFIED

## Identity
- Path: /Users/sac/truex
- Remote: https://github.com/seanchatmangpt/truex.git (upstream origin/main)
- Branch: main@9a487fa, last commit 2026-09-17, 74 commits, 827 MB (.git 581 MB, vendors 51 MB)
- Languages/build: Rust (Cargo.toml, crates/), TypeScript/pnpm workspace (packages/,
  pnpm-workspace.yaml), Justfile
- Nested repos: none declared; vendors/POWL is a git checkout with no .gitmodules entry

## Observed state
- Dirty 2 (deleted): .agents/hooks.json, .agents/truex-doctor.ts
- Untracked 3: docs/jira/v26.9.19/
- Ahead 0 / behind 0; stash 0; 23 unpushed local branches
- Build dirs: node_modules absent; no target/
- Local data: gall_truex.db (SQLite, top level), auto-property-insurance.pdf, receipts/
- Top-level clutter: many fix-*.js / refactor-*.cjs scratch scripts

## What it is
README still says "Proxyable" (dynamic JS proxy library) — the repo was rebranded (rebrand
script present) into truex, a Rust+TS workspace with agents, receipts and operation2030 docs.
Exact current purpose is unclear from README.

## Classification
ACTIVE (census); evidence suggests WARM (last commit Sept 2026) — keep ACTIVE per census.

## Migration risk
MEDIUM — 23 unpushed branches; gall_truex.db and receipts/ are local data; vendors/POWL is an
untracked nested checkout.

## Recommended action
COMMIT-PUSH
1. `cd /Users/sac/truex && git status`; DECISION: the two .agents deletions — commit or restore.
2. `git add -A && git commit -m "docs(jira): v26.9.19 + agents cleanup" && git push`
3. `git branch -vv | grep -v '\[origin'`; DECISION push the 23 branches or
   `git bundle create /Volumes/ARCHIVE/truex-full.bundle --all`.
4. `cp gall_truex.db /Volumes/ARCHIVE/truex/` (DECISION: is this DB needed or regenerable?).
5. `cd vendors/POWL && git remote -v` to record its upstream; re-clone there, do not copy.
6. Re-clone on the new machine.

## First commands on the new machine
`cargo check --workspace && pnpm install && pnpm test` (stated, not run)

## See Also
- ../v26.9.19/ , ../v26.9.17/
- /Users/sac/docs/jira/v26.11.16/README.md
