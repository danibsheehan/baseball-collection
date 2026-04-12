---
name: api-proxy-hardening
description: >
  Hardening and extending the Express MLB proxy (server.js), query/path validation
  in lib/, and how the browser client talks to APIs. Use when adding or changing
  proxy routes, validation, CORS, caching headers, timeouts, streaming errors,
  SSRF-safe URL construction, or aligning dev/prod behavior with VITE_API_BASE.
---

# API / proxy hardening (baseball-collection)

## Architecture (three modes)

| Mode | Client `baseURL` | API traffic |
|------|------------------|-------------|
| **Vite dev** | `location.origin` | Vite proxies `/teams` and `/people` → `server.js` on `127.0.0.1:3000` (`vite.config.mjs`). |
| **Express + `dist`** (`npm start`) | `location.origin` | Same-origin; `server.js` serves static files and proxies MLB. |
| **GitHub Pages** | `VITE_API_BASE` (MLB root) | **No** `server.js`; browser calls MLB directly (CORS). |

Changes to **`server.js`** affect **local / Node hosting only**. Production Pages behavior depends on **`src/http-common.js`** and env—keep paths and query shapes **consistent** with what the SPA already calls.

## Current server contract (`server.js`)

- **Axios client** `mlbClient`: fixed `baseURL` to MLB Stats API v1, **streaming** `responseType: 'stream'`, `validateStatus: () => true` (upstream status is forwarded), **30s** timeout, HTTP(S) agents with **keepAlive** and **maxSockets: 50**.
- **`proxyMlb(req, res, relativePath, cacheControl)`** — only call with **`relativePath` built from fixed templates** plus **validated** params (never concatenate raw `req.url` into MLB paths—**SSRF** risk).
- **`pipeMlbToResponse`** — copies `Content-Type`, sets `Cache-Control`, pipes stream; stream errors → **502** `{ message: '...' }` if headers not sent, else `res.destroy()`.
- **Catch in `proxyMlb`** — network/upstream failures → **502** `{ message: 'Failed to reach MLB API' }`.
- **CORS** — global middleware allows `*` and common headers; tighten origins if the proxy is exposed beyond local dev.

## Validation (`lib/peopleQueryValidation.cjs`)

- **`validatePersonIdsQuery(raw)`** — `raw` from `personIds` or **`ids`** query; must match **`^\d+(,\d+)*$`** after trim (no empty segments, no leading/trailing commas). On failure respond **400** JSON `{ message }` (same pattern as `server.js` today).
- **`validatePlayerIdParam(playerId)`** — digits only; else **400**.
- **Tests**: `lib/peopleQueryValidation.test.mjs` (Vitest). **Extend tests** whenever validation rules change.

Use **`encodeURIComponent`** only on **already-validated** fragments when building MLB query strings (see `/people` → `personIds=${encodeURIComponent(parsed.trimmedIds)}`).

## Per-route caching

`CACHE` maps route kind → `Cache-Control` (`teams`, `roster`, `people`). When tuning TTLs, consider roster freshness vs MLB CDN behavior and document the tradeoff in the PR or commit message.

## Adding a new proxy route

1. Decide if the SPA needs the same path on **Pages** (then client must call MLB or you add a **public** CORS-safe host)—do not assume `server.js` exists in production.
2. **Allowlist** the MLB subpath pattern; validate **every** dynamic segment.
3. Respond with **consistent JSON** errors (`{ message: string }`) for **400** / **502**; preserve MLB status for proxied success/error bodies when streaming (current behavior).
4. Add or extend **`lib/*.cjs`** validation + **`lib/*.test.mjs`** for non-trivial input rules.
5. If Vite dev should hit the new route, add a **`server.proxy`** entry in **`vite.config.mjs`** matching the path prefix.

## Optional hardening ideas (not implemented)

Rate limiting, request size caps, structured logging (request id), allowlisted HTTP methods, and **`http` vs `https`** for MLB upstream (today `baseURL` uses `http:` as in code—changing it is a deliberate ops choice). Mention only when the user asks for that class of change.
