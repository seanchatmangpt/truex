# Experimental Project Report: truex-kernel-backups

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/truex-kernel-backups`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- *No standard executable entry points found (depth <= 2)*

## 3. Extracted Documentation & Context
### Source: `truex-kernel-backups/RECOVERY.md`
```markdown
# truex-kernel Preservation Snapshot — 2026-05-15

Backup created before cleanup of 334 uncommitted files / 16 stashes / 17 worktrees in `/Users/sac/truex-kernel`.

## Files in this directory

| File | Purpose |
|---|---|
| `truex-kernel-bundle-20260515-161011.bundle` | Portable git bundle. All refs + reachable objects. 486M. |
| `truex-kernel-dot-git-20260515-161011.tar.zst` | Bit-for-bit tar.zst of `.git/` (incl. dangling objects + reflog). 499M. |
| `RECOVERY.md` | This file. |

## What's preserved

Every uncommitted byte is reachable via a permanent ref in the repo's `.git/refs/`:

| Ref namespace | Count | Purpose |
|---|--:|---|
| `backup/pre-cleanup-2026-05-15` (tag) | 1 | Annotated tag pinning the pre-cleanup HEAD on `main`. Recovery anchor. |
| `wip/stash-N-<label>` | 16 | Each of the 16 `git stash list` entries materialized as a branch (so stash drop / reflog expiration cannot destroy them). |
| `wip/main-tree-2026-05-15` | 1 | Snapshot of `main`'s working tree at preservation time. 3-parent stash-style commit (P1=HEAD, P2=index, P3=untracked). All 334 uncommitted file changes (incl. PhD theses, `truex-kernel/src/advanced/`, real-data tests) recoverable. |
| `wip/worktree-<name>-2026-05-15` | 11 | Per-worktree working-tree snapshot for each of the 11 worktrees that had meaningful uncommitted content (includes untracked new crates `truex-kernel-prolog`, `truex-kernel-simd-prolog`; new shell completions; cognition command tree). |
| `rescue/dangling-<short>-<slug>` | 5 | Substantive dangling commits found by `git fsck` that were not reachable from any other ref. |
| **Total preservation refs** | **34** | |

Plus: the original `refs/stash` (16 stashes) is untouched, in addition to the `wip/stash-*` branches.

## How to restore — common scenarios

### Scenario 1: I accidentally `git reset --hard` and lost the working tree

```bash
cd /Users/sac/truex-kernel

# Re-apply the entire main working tree snapshot (tracked + index + untracked).
git stash apply wip/main-tree-2026-05-15
# That's it. Working tree is back exactly as it was at 2026-05-15 16:10.
```

### Scenario 2: I dropped a stash I needed
...
```

