'use strict';

const MSG_MISSING = 'Missing or invalid personIds query (comma-separated person IDs).';
const MSG_INVALID_FORMAT = 'personIds must be comma-separated numeric person IDs.';
const MSG_TOO_MANY_IDS = 'personIds must contain at most 50 person IDs.';
const MSG_INVALID_PLAYER = 'Invalid player id.';

// Keep in sync with PEOPLE_BATCH_SIZE in src/lib/rosterPeople.ts — that's the largest batch
// the app itself ever sends, so this is the enforced ceiling on the wire.
const MAX_PERSON_IDS = 50;

/**
 * @param {unknown} raw - req.query.personIds ?? req.query.ids
 * @returns {{ ok: true, trimmedIds: string } | { ok: false, message: string }}
 */
function validatePersonIdsQuery(raw) {
  if (raw == null || typeof raw !== 'string' || !raw.trim()) {
    return { ok: false, message: MSG_MISSING };
  }
  const ids = raw.trim();
  if (!/^\d+(,\d+)*$/.test(ids)) {
    return { ok: false, message: MSG_INVALID_FORMAT };
  }
  if (ids.split(',').length > MAX_PERSON_IDS) {
    return { ok: false, message: MSG_TOO_MANY_IDS };
  }
  return { ok: true, trimmedIds: ids };
}

/**
 * @param {string} playerId - req.params.playerId
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
function validatePlayerIdParam(playerId) {
  if (!/^\d+$/.test(playerId)) {
    return { ok: false, message: MSG_INVALID_PLAYER };
  }
  return { ok: true };
}

module.exports = {
  validatePersonIdsQuery,
  validatePlayerIdParam,
};
