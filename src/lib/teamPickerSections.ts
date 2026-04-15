export type PickerTeam = {
	name?: string;
	league?: { id?: number; name?: string };
	locationName?: string;
	teamName?: string;
	shortName?: string;
	venue?: { name?: string };
};

export type TeamPickerSection = {
	id: string;
	label: string | null;
	teams: PickerTeam[];
};

type LeagueBucket = {
	leagueId: number | undefined;
	label: string | null;
	teams: PickerTeam[];
};

/**
 * Group MLB-shaped teams into picker sections (AL / NL when league ids differ).
 */
export function buildTeamPickerSections(
	sortedTeams: PickerTeam[] | null | undefined
): TeamPickerSection[] {
	const list = sortedTeams || [];
	if (!list.length) {
		return [];
	}

	const byKey = new Map<string, LeagueBucket>();
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
		byKey.get(key)!.teams.push(t);
	}

	if (byKey.size <= 1) {
		return [{ id: 'picker-all', label: null, teams: list }];
	}

	const sortByName = (a: PickerTeam, b: PickerTeam) =>
		String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });

	/** MLB Stats API convention: 103 = AL, 104 = NL */
	const orderIds = [103, 104];
	const out: TeamPickerSection[] = [];
	const consumed = new Set<string>();

	for (const lid of orderIds) {
		const key = `id:${lid}`;
		if (!byKey.has(key)) {
			continue;
		}
		const block = byKey.get(key)!;
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

export function filterTeamPickerSections(
	sections: TeamPickerSection[],
	query: string
): TeamPickerSection[] {
	const q = String(query || '')
		.trim()
		.toLowerCase();
	if (!q) {
		return sections;
	}

	const matches = (t: PickerTeam) => {
		const hay = [t.name, t.teamName, t.locationName, t.shortName, t.venue?.name]
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
