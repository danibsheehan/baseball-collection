/**
 * Group MLB-shaped teams into picker sections (AL / NL when league ids differ).
 * @param {Array<{ name?: string, league?: { id?: number, name?: string }, locationName?: string, teamName?: string, shortName?: string, venue?: { name?: string } }>} sortedTeams
 * @returns {Array<{ id: string, label: string | null, teams: typeof sortedTeams }>}
 */
export function buildTeamPickerSections(sortedTeams) {
	const list = sortedTeams || [];
	if (!list.length) {
		return [];
	}

	const byKey = new Map();
	for (const t of list) {
		const lid = t.league?.id;
		const key = lid != null ? `id:${lid}` : '_';
		if (!byKey.has(key)) {
			byKey.set(key, {
				leagueId: lid,
				label: t.league?.name || null,
				teams: []
			});
		}
		byKey.get(key).teams.push(t);
	}

	if (byKey.size <= 1) {
		return [{ id: 'picker-all', label: null, teams: list }];
	}

	const sortByName = (a, b) =>
		String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });

	/** MLB Stats API convention: 103 = AL, 104 = NL */
	const orderIds = [103, 104];
	const out = [];
	const consumed = new Set();

	for (const lid of orderIds) {
		const key = `id:${lid}`;
		if (!byKey.has(key)) {
			continue;
		}
		const block = byKey.get(key);
		out.push({
			id: `league-${lid}`,
			label: block.label || (lid === 103 ? 'American League' : 'National League'),
			teams: [...block.teams].sort(sortByName)
		});
		consumed.add(key);
	}

	for (const [key, block] of byKey) {
		if (consumed.has(key)) {
			continue;
		}
		const slug = String(block.leagueId ?? key).replace(/\W+/g, '-');
		out.push({
			id: `league-${slug}`,
			label: block.label || 'Other',
			teams: [...block.teams].sort(sortByName)
		});
	}

	return out;
}

/**
 * @param {ReturnType<typeof buildTeamPickerSections>} sections
 * @param {string} query
 */
export function filterTeamPickerSections(sections, query) {
	const q = String(query || '')
		.trim()
		.toLowerCase();
	if (!q) {
		return sections;
	}

	const matches = (t) => {
		const hay = [
			t.name,
			t.teamName,
			t.locationName,
			t.shortName,
			t.venue?.name
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
		return hay.includes(q);
	};

	return sections
		.map((s) => ({
			...s,
			teams: s.teams.filter(matches)
		}))
		.filter((s) => s.teams.length > 0);
}
