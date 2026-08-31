---
name: dependabot-triage
description: >-
  Reviews open Dependabot PRs (npm, GitHub Actions) that dependabot-auto-merge
  didn't already merge, reads each one's embedded changelog and required CI
  status to classify risk, and merges only the PRs the user explicitly names.
  Use when asked to review or triage Dependabot PRs, do the weekly dependency
  review, or check the Dependabot backlog.
---

# Dependabot triage (baseball-collection)

`.github/dependabot.yml` opens weekly PRs across two ecosystems (npm, GitHub Actions — both
ungrouped, capped at 10 open each). `.github/workflows/dependabot-auto-merge.yml` already
auto-merges **patch/minor** bumps once the required `unit-tests` check is green — so by the time
you run this skill, what's actually sitting in the backlog is the harder cases: **major** bumps
(never auto-merged), anything CI-red, and anything the auto-merge workflow hasn't gotten to yet.
This skill reads and classifies those; merging still requires the user to name which PRs.

## Order of work

### 1. List open Dependabot PRs

```bash
gh pr list --author "app/dependabot" --limit 100 --json number,title,labels,createdAt,statusCheckRollup
```

`gh pr list` defaults to 30 results — the two ecosystems' combined cap (10 each) already sits at
that boundary, and Dependabot **security updates** open outside the configured cap, so an unset
`--limit` can silently truncate the backlog with no warning. Always pass `--limit`.

If there are none open, say so and stop — nothing to triage.

### 2. Gather signal per PR

- **Ecosystem / bump shape** from the title and labels: `github_actions` or `npm`
  (`Bump <package> from X to Y`) — see `.github/dependabot.yml`.
- **Required CI only** — this repo's only merge-blocking check is **`unit-tests`** (runs
  `format:check`, `lint`, `test:coverage`, `build` — see `pull-request-tests.yml` and the
  `pr-ready` skill). `Analyze (actions)` / `Analyze (javascript-typescript)` (CodeQL) and
  `lighthouse` are informational; ignore their state when judging mergeability.
- **Changelog** — `gh pr view <n> --json body`. Dependabot embeds the release notes in a
  collapsible `<details>` block. Scan for:
  - Security signals: `CVE`, `GHSA`, "security fix" — treat as **Security** regardless of size.
  - Breaking signals: `[BREAKING]`/`[CHANGE]` entries describing removed/renamed APIs, or a
    "minimum required Node version" bump.
  - Otherwise routine (bugfixes, features, docs).

### 3. Classify each PR

Evaluate in this order — first match wins:

1. **Security** — changelog/advisory references a CVE/GHSA or explicit security fix. Flag first,
   regardless of ecosystem or bump size; recommend merging promptly once `unit-tests` is green.
2. **Needs a look** — any of:
   - A **major** version bump (or a 0.x → 1.x jump) — `dependabot-auto-merge` never touches these.
   - A breaking/minimum-version changelog entry (see step 2).
   - `unit-tests` red.
   - Still open after a few days despite being patch/minor — worth checking why auto-merge hasn't
     picked it up (e.g. a merge conflict, or `unit-tests` never went green).
3. **Low risk** — a patch/minor bump, `unit-tests` green, no breaking/minimum-version changelog
   entries. In the normal case `dependabot-auto-merge` already merges these before you ever see
   them; a tier-3 PR still open usually means something's blocking it (see tier 2's last bullet).

### 4. Report — do not merge yet

One table: PR #, package, bump, tier, one-line why (cite the changelog line that drove the
classification, not just "looks fine"). Stop here by default.

### 5. Merge only what the user names

```bash
gh pr merge <number> --squash
```

Matches the repo's existing convention (squash — see `git log`). Merge only PRs the user
explicitly names in their reply (e.g. "merge #212 and #214"). Do not batch-merge an entire tier
on your own initiative — per `AGENTS.md`, never merge a PR unless asked.

## Anti-patterns

- Merging anything the user didn't explicitly name this session.
- Treating a red **optional** check (CodeQL/Lighthouse) as blocking, or a green one as sufficient
  to skip reading the changelog.
- Classifying by semver label alone without reading the embedded release notes — they're already
  in the PR body; use them.
- Assuming `dependabot-auto-merge` already handled everything patch/minor without checking —
  auto-merge can stall on a merge conflict or a flaky `unit-tests` run.

## Reference

- Config: `.github/dependabot.yml`. Auto-merge: `.github/workflows/dependabot-auto-merge.yml`.
- Required-check source: `.github/workflows/pull-request-tests.yml` (`unit-tests` job).
