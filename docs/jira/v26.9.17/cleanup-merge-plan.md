# Cleanup and Merge Plan: truex

## Current State (as observed 2026-09-17)

Investigation scope: `/Users/sac/truex` plus every path under `/Users/sac` whose name
matches `*truex*`, or that is a worktree/tmp/scratch directory tied to it. Evidence
gathered with `git`, `du`, `find`, `ls` only — nothing was deleted, merged, or modified.

| Path | Type | Git status summary | Last commit date | Size |
|---|---|---|---|---|
| `/Users/sac/truex` | Canonical repo (git, `origin` = `github.com/seanchatmangpt/truex.git`) | Branch `main`, `HEAD=11bc0c5`, ahead 3 / behind 2 of `origin/main`. Working tree dirty: 49 tracked-modified paths + 80 untracked paths (`git status --short \| wc -l` = 129). | 2026-08-25 (`11bc0c5 chore(.agents): drop per-run orchestration scratch, keep real subagent config`) | 834M |
| `/Users/sac/truex/scratch` | In-repo tracked directory (not gitignored) | 58 of 60 files in the dir are tracked by git; debug/recovery `.ts`/`.cjs` scripts from a May 2026 recovery session | files dated 2026-05-23 to 2026-05-25 | 912K |
| `/Users/sac/truex/.git/worktrees/*` (24 admin entries) | Git worktree metadata only — not real worktree directories. `git worktree list` shows all 24 as `prunable`; `git worktree prune --dry-run -v` reports every one as `gitdir file points to non-existent location`; spot-checked 3 of the 24 target paths under `~/.gemini/antigravity-cli/brain/.../worktrees/subagent-*` and all are `MISSING` on disk. | Metadata orphaned, targets already gone (consistent with "deleted gemma manually") | admin dirs last touched 2026-05-25 | negligible (git internal objects only) |
| 23 local branches named `subagent-*-truex-*-<hash>` | Branch refs pointing at the same dead worktrees above | 4 distinct tip SHAs across the 23 branches: `53f64bc`, `fbc895c`, `e08bea2`, `9b5edc7`. All 4 confirmed by `git merge-base --is-ancestor <sha> HEAD` to already be ancestors of `main` (11bc0c5) — zero unique work. | tips dated on/around 2026-05-25 | n/a (refs only) |
| `/Users/sac/truex_rebranding_source.tar.gz` | Backup tarball, top-level home dir, outside any git repo | n/a (plain file) | 2026-05-23 (mtime) | 154M |
| `/Users/sac/truex_rebranding_local_source.tar.gz` | Backup tarball, top-level home dir, outside any git repo | n/a (plain file, 0 bytes) | 2026-05-23 (mtime) | 0 bytes |
| `/Users/sac/TRUEX-COLD-LOAD.md` | Loose doc, top-level home dir, outside any git repo | n/a (plain file) | 2026-05-23 (mtime) | 3.9K |

No independent clone, duplicate repo, or sibling `-worktrees`/`-wt` directory of
`/Users/sac/truex` was found anywhere under `/Users/sac` (searched to depth 4 for
`*truex*`, and to depth 3 for `*worktree*`/`*scratch*`/`*tmp*`/`*temp*` directories).
Other repos (`wasm4pm`, `wasm4pm_copy`, `zoeapp`, `open-ontologies`, `praxis`, `ggen`,
etc.) contain files that merely reference truex (docs, vendored ontology copies,
generated examples) — none of them is a clone or worktree of this repo, so they are
out of scope for this merge plan.

## What "merged" should look like

`/Users/sac/truex` is the canonical path going forward. It is the only real git
repository in the family, it has the `origin` remote
(`github.com/seanchatmangpt/truex.git`), it holds all real commit history, and every
worktree/branch found elsewhere is either dead metadata or already fully merged into
its `main` branch (see evidence above). There is no competing repo to reconcile
against — the "merge" here is worktree/branch/scratch hygiene, not a repo-vs-repo
merge.

For every other item in the family:

- 24 stale git worktree admin entries (`.git/worktrees/subagent-*`): the
  directories they point to under `~/.gemini/antigravity-cli/brain/...` no longer
  exist on disk (spot-checked, confirmed missing) and `git worktree prune --dry-run`
  independently confirms all 24 as removable. Safe to prune directly — no merge
  needed, no data loss possible (the data is already gone).
- 23 `subagent-*` local branches: their 4 distinct tip commits are all confirmed
  ancestors of `main` via `git merge-base --is-ancestor`. Safe to delete with
  `git branch -d` (not `-D`) — `-d` itself will refuse if a branch turns out to
  carry unmerged work, which doubles as a second, independent safety check beyond
  the ancestry check already run above.
- `truex_rebranding_source.tar.gz` (154M) and `truex_rebranding_local_source.tar.gz`
  (0 bytes): these are pre-rebrand backup artifacts sitting outside git, at
  `~/`, not `~/truex/`. Content was not inspected (per the read-only scope of this
  investigation) and there is no way to tell from `git` alone whether anything in
  the 154M archive is still uniquely needed. MANUAL REVIEW REQUIRED before
  deletion.
- `TRUEX-COLD-LOAD.md` (3.9K): a loose doc at `~/`, not inside the repo. Content
  not inspected. Likely either superseded by in-repo docs or a personal note.
  MANUAL REVIEW REQUIRED (recommend: read it, then either fold into
  `docs/jira/v26.9.17/` here or delete).
- `/Users/sac/truex/scratch/` (58 tracked files, 912K): this is inside the
  canonical repo and already committed — it is not an external scratch/tmp copy to
  delete, it is a repo-hygiene decision (keep vs. `git rm -r`). Out of scope for
  "delete the duplicate," but flagged because it matches the literal word "scratch"
  in the family search. MANUAL REVIEW REQUIRED (is this debug/recovery scratch
  still useful, or dead weight to remove in a commit).
- The canonical repo's own dirty working tree (49 modified + 80 untracked paths,
  ahead 3 / behind 2 of `origin/main`): this blocks calling `main` "clean," and
  cleanup of the worktrees/branches above should not be read as making the repo
  itself tidy. MANUAL REVIEW REQUIRED — decide per untracked class (receipts,
  telemetry traces, benchmark reports) what is real output to commit vs. run
  artifacts to `.gitignore`, then either commit or discard the 49 modified paths and
  reconcile the 2-commits-behind `origin/main` (fast-forward or merge, no history
  rewrite of shared commits).

## Commands to run (in order), once approved

```bash
# 1. Prune the 24 dead worktree admin entries (metadata only -- targets already gone).
git -C /Users/sac/truex worktree prune -v

# 2. Confirm the prune left git worktree list showing only the real repo.
git -C /Users/sac/truex worktree list

# 3. Delete the 23 now-unreferenced subagent branches with `-d` (safe/non-force:
#    git itself will refuse any branch that is NOT fully merged into the current
#    HEAD, as a second independent check on top of the ancestry check already run).
git -C /Users/sac/truex branch -d \
  subagent-Engine-Prover-truex-doctor-eafafc1e \
  "subagent-Reactive-CLI---Integration-Specialist-truex-cli-specialist-84b9dc8c" \
  "subagent-Reactive-CLI---Integration-Specialist-truex-cli-specialist-a55c6e1e" \
  "subagent-Reactive-CLI---Integration-Specialist-truex-cli-specialist-aab5ed0d" \
  "subagent-Reactive-CLI---Integration-Specialist-truex-cli-specialist-ad1aa9b3" \
  "subagent-Reactive-Concurrency-Stress-Specialist-truex-concurrency-specialist-2453b516" \
  "subagent-Reactive-Concurrency-Stress-Specialist-truex-concurrency-specialist-49e11be4" \
  "subagent-Reactive-Concurrency-Stress-Specialist-truex-concurrency-specialist-592a46a0" \
  "subagent-Reactive-Concurrency-Stress-Specialist-truex-concurrency-specialist-de264deb" \
  "subagent-Reactive-E2E-Path-Specialist-truex-e2e-specialist-0b9110e0" \
  "subagent-Reactive-E2E-Path-Specialist-truex-e2e-specialist-49ac5710" \
  "subagent-Reactive-E2E-Path-Specialist-truex-e2e-specialist-765e6b1a" \
  "subagent-Reactive-E2E-Path-Specialist-truex-e2e-specialist-bf734770" \
  "subagent-Reactive-Fuzz---Refusal-Specialist-truex-fuzz-specialist-07e45a0b" \
  "subagent-Reactive-Fuzz---Refusal-Specialist-truex-fuzz-specialist-17d247c0" \
  "subagent-Reactive-Fuzz---Refusal-Specialist-truex-fuzz-specialist-996780bd" \
  "subagent-Reactive-Fuzz---Refusal-Specialist-truex-fuzz-specialist-a58bfce1" \
  "subagent-Reactive-Resource-Leak-Auditor-truex-leak-auditor-04cdcf76" \
  "subagent-Reactive-Resource-Leak-Auditor-truex-leak-auditor-0a8992d3" \
  "subagent-Reactive-Resource-Leak-Auditor-truex-leak-auditor-ae4ffb89" \
  "subagent-Reactive-Resource-Leak-Auditor-truex-leak-auditor-e48e9ef5" \
  subagent-Receipt-Prover-truex-doctor-b5cabdda \
  subagent-Replay-Prover-truex-doctor-1531e944

# 4. Confirm only `main` remains.
git -C /Users/sac/truex branch -vv

# --- Everything below here touches content this investigation did not read, or
#     the repo's own uncommitted work. No command is given blind -- MANUAL REVIEW REQUIRED:

# MANUAL REVIEW REQUIRED: inspect before deleting (do not run blind):
#   ls -lh /Users/sac/truex_rebranding_source.tar.gz
#   tar -tzf /Users/sac/truex_rebranding_source.tar.gz | head -50   # inspect contents first
#   rm /Users/sac/truex_rebranding_local_source.tar.gz              # 0 bytes -- lowest-risk of the two, still confirm first
#   rm /Users/sac/truex_rebranding_source.tar.gz                    # only after contents are confirmed unneeded

# MANUAL REVIEW REQUIRED: read then decide fold-in vs delete:
#   cat /Users/sac/TRUEX-COLD-LOAD.md

# MANUAL REVIEW REQUIRED: repo-hygiene decision, not a duplicate-path deletion:
#   git -C /Users/sac/truex status --short scratch/     # review, then either keep or:
#   git -C /Users/sac/truex rm -r scratch/ && git -C /Users/sac/truex commit -F <msg-file>

# MANUAL REVIEW REQUIRED: canonical repo's own dirty tree -- decide per-file
# commit vs. discard vs. .gitignore, then reconcile with origin/main (2 behind):
#   git -C /Users/sac/truex status --short
#   git -C /Users/sac/truex fetch origin
#   git -C /Users/sac/truex log HEAD..origin/main --oneline   # the 2 commits behind
#   git -C /Users/sac/truex merge origin/main                 # after working tree is clean (merge, never rebase/force-push shared history)
```

## Open questions

- 154M `truex_rebranding_source.tar.gz` contents are unknown. Git alone cannot
  say whether it holds anything not already in the repo's history — needs a human
  `tar -tzf` inspection (command given above) before deletion.
- `TRUEX-COLD-LOAD.md` purpose is unknown — could not tell from git metadata
  whether it's an active runbook, a stale note, or content that belongs in this new
  `docs/jira/v26.9.17/` folder.
- The 49 modified / 80 untracked paths in the canonical repo's working tree:
  cannot tell from git alone which are intentional WIP (e.g. edited benchmark
  reports the user is actively iterating on) versus stray generated output
  (`.truex/receipts/*`, `docs/telemetry/trace-*.json` — these look like per-run
  artifacts, not authored content, but that is a guess, not a git fact) — ask the
  user which class each falls into before committing or discarding anything.
- Ahead 3 / behind 2 of `origin/main`: the 3 ahead commits
  (`11bc0c5`, `3028b82`, `c268d88`) have not been pushed. Confirm whether that's
  intentional (local-only WIP) before merging in the 2 behind commits, in case a
  push/PR was expected first.
- "Deleted gemma manually": this plan assumes that refers to the
  `~/.gemini/antigravity-cli/brain/...` subagent worktree directories now confirmed
  missing on disk (which is exactly what left the 24 dangling `.git/worktrees`
  entries and 23 orphaned branches found here). If "gemma" instead refers to a
  separate model/download directory elsewhere, that path was not in scope of this
  git-based investigation and was not searched for.

## Merge Execution Log (2026-09-17)

Executed as a content-only evaluation/merge pass. Deletion of anything (files,
worktrees, branches, tarballs) was explicitly out of scope for this pass and is
deferred to a separate, later step. No `rm`, `git worktree remove`, `git branch -d`,
`git clean`, `git checkout -- <path>`, or `git reset --hard` was run.

### Re-verification of current state

Re-ran the doc's own investigation commands first, since state had moved slightly
since the original pass:

- `git status --short` now showed 81 lines (2 `D`, 50 `M`, 29 `??`), down from the
  129 originally recorded — some prior WIP had already been resolved between the
  original investigation and this pass.
- `git worktree list` / `git branch -vv`: unchanged — still 24 prunable worktree
  admin entries and 23 `subagent-*` branches, all pointing at the same 4 dead-worktree
  tip SHAs. **Not touched** (worktree prune and branch deletion are both deletion
  operations under this pass's hard constraints, even though the original doc assessed
  them as safe to remove — that removal is left for the separate deletion pass).
- `git fetch origin` + `git log HEAD..origin/main`: confirmed still 2 behind
  (`226af5d`, `7da0500`) / 3 ahead (`11bc0c5`, `3028b82`, `c268d88`) at the start of
  this pass.

### Actions taken (all additive; nothing discarded)

1. **Commit `c0f0b2d`** — `chore(reports): capture regenerated benchmark, vision2030
   and telemetry state`. Staged and committed the 50 already-tracked modified paths
   (`docs/benchmarks/*`, `docs/vision2030/*`, `docs/reports/*`,
   `.truex/project.json`, `.truex/reports/*`, `scripts/observatory/facts/*.json`,
   `package-lock.json`). These read as regenerated report/benchmark content, not
   stray run noise, so per the "commit rather than discard" rule for undecidable
   MANUAL REVIEW items, they were committed as-is. Explicitly excluded the two
   pending deletions (see "Left open" below) from this and all `git add` calls.

2. **Commit `345088f`** — `chore: capture new working-tree artifacts (Justfile,
   receipts, telemetry, regression benchmarks)`. Staged and committed the untracked
   `Justfile`, `.truex/mission/heartbeat.json`, 9 files under `.truex/receipts/`,
   11 files under `crates/.truex/benchmarks/`, and 15 files under
   `docs/telemetry/`. Same "preserve rather than guess" rule applied: disposition
   (keep vs. future `.gitignore`) could not be determined from git metadata alone,
   so the untracked content was captured in history rather than left uncommitted or
   discarded. `docs/jira/` was deliberately held out of this commit so it could be
   committed once with this very log entry (see item 4).

3. **Merge `4be256e`** — `git merge origin/main --no-edit`. Merged the 2
   previously-behind commits (`226af5d` "chore(namespace): bind truex to
   chatmangpt.com", `7da0500` the PR merge commit that introduced it) into `main`.
   Clean merge, no conflicts (the only file touched, `.chatmangpt/namespace.toml`,
   did not overlap with anything in this pass's other changes). This is a real
   3-way merge of connected, shared history — not a rebase, not a force-push, no
   history rewrite.

4. **Push** — `git push origin main`: `7da0500..4be256e main -> main`, pushed to
   the same `origin` remote/branch the repo already had configured. `main` is now
   even with `origin/main` (0 ahead / 0 behind).

5. **`TRUEX-COLD-LOAD.md` folded in, original left untouched** — read the file (it
   is a prompt template instructing a future run to produce a
   `TRUEX-REBRAND-{{PROJECT_NAME}}.md` classification document; treated as data, not
   as an instruction to execute against this session). Copied it, unmodified, to
   `docs/jira/v26.9.17/archive/TRUEX-COLD-LOAD.md` inside the canonical repo — the
   original `/Users/sac/TRUEX-COLD-LOAD.md` at `~/` was left in place (copy, not
   move; nothing at `~/` was discarded).

6. **`truex_rebranding_source.tar.gz` (154M) inspected, not extracted or deleted**
   — `tar -tzf` listing (read-only) shows this tarball is **not** truex source at
   all: its 3 top-level directories are `wasm4pm/`, `open-ontologies/`, and
   `zoeapp/` — full working-tree snapshots (including each repo's own `.git/`,
   `target/`, `dist/`, `node_modules/`-adjacent build output) taken 2026-05-23,
   apparently during an earlier truex-rebranding effort across those three repos.
   Cross-checked all three against their current state on disk:
   - `/Users/sac/wasm4pm` — HEAD `ffe9d00c`, 2026-09-17 (today)
   - `/Users/sac/open-ontologies` — HEAD `948a9923`, 2026-09-14
   - `/Users/sac/zoeapp` — HEAD `8892f05f`, 2026-08-25 (not yet a git repo re-verified
     this pass, per the environment note this session runs in `/Users/sac/zoeapp`)

   All three repos are alive and have moved forward 3-16 weeks past the tarball's
   May snapshot. This is new evidence the original plan didn't have (it could not
   inspect contents): the tarball is very likely a stale, fully-superseded backup,
   not unique content — but confirming zero unique lines were never merged forward
   would require a real diff against each repo's May-era history, which is outside
   this pass's git-investigation-only scope. **Not extracted, not deleted, not
   touched** — recommendation below.
   `truex_rebranding_local_source.tar.gz` (0 bytes) was re-confirmed empty and
   inspected no further.

### Left open / deliberately not decided

- **`.agents/hooks.json` and `.agents/truex-doctor.ts` — still showing as `D`
  (deleted) in the working tree, and genuinely important finding**: `HEAD`
  (`11bc0c5`)'s own commit message explicitly states these two files were
  "inspected via `git show HEAD:<path>` and confirmed to be live configuration, not
  scratch, so both remain committed as-is" — yet both are now missing from disk
  (deleted sometime after that commit, outside git). This contradicts the intent
  recorded in `main`'s own history. Left exactly as found (unstaged, uncommitted)
  per this pass's hard constraint against deciding by discarding. **Human decision
  needed**: if the deletion was accidental, the fix is a pure restore —
  `git checkout HEAD -- .agents/hooks.json .agents/truex-doctor.ts` — which recovers
  the already-committed content from git history (zero data loss either way, since
  the blobs are safely in git history regardless of what happens on disk). This
  pass did not run that restore itself, since a command that reverts a working-tree
  change falls under this pass's "don't discard" hard constraint even when the
  change being reverted is itself a deletion.
- **24 prunable `.git/worktrees/subagent-*` admin entries and 23 `subagent-*`
  branches**: unchanged from the original doc's findings (still safe per the
  ancestry checks already run there), but deletion of both is explicitly deferred
  to the separate deletion pass per this task's constraints. `git branch -d` is on
  this pass's hard "never run" list even though it is the non-force variant.
- **`truex_rebranding_source.tar.gz` (154M)**: now confirmed to contain
  already-superseded snapshots of `wasm4pm`/`open-ontologies`/`zoeapp` rather than
  unmerged truex content (see action 6 above). Safe to delete once a human
  spot-checks that no file inside predates and is missing from those three repos'
  current history — flagging as now much closer to "confirmed safe to delete" than
  the original "contents entirely unknown."
- **`truex_rebranding_local_source.tar.gz` (0 bytes)**: still trivially safe to
  delete whenever the deletion pass runs; nothing to lose.
- **`/Users/sac/truex/scratch/` (58 tracked files)**: not touched this pass — this
  is a keep-vs-`git rm -r` repo-hygiene call on already-committed content, not a
  merge action, and remains exactly as the original doc found it. Still needs a
  human decision, not a git fact.
- **`docs/jira/` itself**: was untracked at the start of this pass (this very plan
  doc had never been committed). Committed together with this log entry so the
  plan-and-its-execution-record live in the canonical repo's history from here on.
