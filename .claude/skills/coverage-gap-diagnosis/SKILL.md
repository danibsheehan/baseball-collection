---
name: coverage-gap-diagnosis
description: >-
  Reads local coverage output for the files changed on this branch and names
  the specific untested branches/error paths, instead of a bare percentage.
  Use when coverage is close to a threshold, dropped, or the user asks
  what's undertested, to diagnose a coverage gap, or why coverage failed.
---

# Coverage gap diagnosis (baseball-collection)

CI's coverage step (`npm run test:coverage` → Cobertura → job summary / PR comment) only shows
an aggregate percentage against `vite.config.mjs`'s thresholds (**lines 95, statements 95,
branches 82, functions 85**). It never says which lines, in which changed files, are actually
untested. This skill does that, locally, before or instead of waiting on the CI comment.

## Order of work

### 1. Find the changed source files

```bash
git diff --name-only main...HEAD -- 'src/**/*.ts' 'src/**/*.vue' 'lib/**/*.cjs' \
  | grep -v -e '\.test\.ts$' -e '\.test\.mjs$'
```

Exclude test files themselves. Also check `vite.config.mjs`'s `test.coverage.exclude` list —
`src/App.vue`, `src/http-common.ts`, `src/lib/cardFoilWebgl.ts`, `src/lib/cardFoilDom.ts`,
`src/lib/useCardTilt.ts`, `src/lib/useBinderPennantParallax.ts`, and the foil/Lottie components
are deliberately excluded from coverage measurement (WebGL/DOM/animation code covered indirectly
via UI, not unit tests) — a gap there isn't a gap this skill (or CI) can see.

### 2. Generate coverage

```bash
npm run test:coverage
```

Vitest (v8 provider) prints a per-file **text** table to the terminal with an **`Uncovered Line
#s`** column, and writes `coverage/` (`html`, `cobertura-coverage.xml`) for deeper inspection.

### 3. Find uncovered lines in the changed files

Read the terminal table's row for each changed file, or open `coverage/index.html` /
`coverage/<path>/index.html` in a browser for the annotated source (red = uncovered).

### 4. Describe what's untested, not just where

Read the actual source at each uncovered range. Say what _behavior_ is missing a test — an error
branch, a specific prop/state combination, an empty-state render, an MLB API failure path — not
just "lines 58–83 uncovered." Cross-reference `test-generator`'s coverage checklist (creation/
mount, happy path, edge cases, async, emits, HTTP success/failure) — if the uncovered range is
the HTTP-failure branch specifically, say so.

### 5. Report

One list: file:lines → what's untested → the specific missing test case in `test-generator`
terms. This skill diagnoses; it doesn't write the tests unless asked — offer to, don't assume.

## Anti-patterns

- Reporting bare percentages or raw line numbers with no description of the missing behavior —
  that's what the CI coverage comment already gives you; this skill exists to go further.
- Flagging gaps in files the branch didn't touch (noise) — scope to the diff.
- Flagging gaps in files `vite.config.mjs` deliberately excludes from coverage as if they were
  measurable gaps.
- Writing test code without being asked.

## Reference

- `vite.config.mjs` — `test.coverage.thresholds` / `exclude`.
- `test-generator` — the coverage checklist this diagnoses against.
- Full pre-PR flow: **`pr-ready`** skill.
