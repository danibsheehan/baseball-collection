---
name: definition-of-done
description: >
  Verifies baseball-collection changes by running Prettier format check, lint,
  Vitest, and production build. Use after substantive edits to Vue,
  TypeScript, styles, server/proxy, or config, or when the user asks to
  validate or finish a task.
---

# Definition of done (baseball-collection)

**Prereq:** Node.js **22** (see `.nvmrc`, `package.json` `engines`, CI).

After **substantive** edits (features, components, `src/lib/`, `lib/`, `server.js`, styles, Vite/CI config), run from the repo root in order:

1. `npm run format:check` (or `npm run format` to fix)
2. `npm run lint`
3. `npm run test:run`
4. `npm run build`

Fix failures before considering the task complete.

For small, localized edits, the **smallest** relevant check is enough (e.g. focused Vitest file, or lint only). Do **not** require full coverage or a Pages-shaped build for every tweak.

## When to also run a Pages-shaped build

If the change touches deploy base path, client API base, or static hosting:

- `vite.config.mjs` / `VITE_PUBLIC_PATH` / `VITE_API_BASE` usage
- `.github/workflows/deploy-pages.yml`
- Asset paths that break under a project-Pages subpath

Then build like CI (see **`.claude/skills/github-pages-deploy/SKILL.md`**):

```bash
VITE_PUBLIC_PATH=/baseball-collection/ VITE_API_BASE=https://statsapi.mlb.com/api/v1 npm run build
```

(Replace the public path segment if the GitHub repo name differs.)

## Related

- Before opening a PR, use **`.claude/skills/pr-ready/SKILL.md`** (`test:coverage` matches CI).
- Proxy / validation changes: **`api-proxy-hardening`**. Bundle size: **`bundle-performance`**.
