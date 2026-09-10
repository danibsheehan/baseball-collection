'use strict';

// Only local Vite dev origins ever make a genuine cross-origin browser request to server.js:
// in Vite dev the browser calls Vite itself (same-origin), which proxies server-to-server to
// server.js (vite.config.mjs); production (GitHub Pages) never runs server.js at all. This
// allowlist exists to stop third-party sites from driving traffic through the proxy, not to
// enable any origin this app actually depends on today. Extend it if a new origin genuinely
// needs to call server.js directly from a browser.
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/**
 * @param {string | undefined} origin - req.header('Origin')
 * @returns {boolean}
 */
function isAllowedOrigin(origin) {
  return typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin);
}

module.exports = {
  ALLOWED_ORIGINS,
  isAllowedOrigin,
};
