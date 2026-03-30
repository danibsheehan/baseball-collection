'use strict';

const MSG_MISSING =
	'Missing or invalid personIds query (comma-separated person IDs).';
const MSG_INVALID_FORMAT =
	'personIds must be comma-separated numeric person IDs.';
const MSG_INVALID_PLAYER = 'Invalid player id.';

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
	validatePlayerIdParam
};
