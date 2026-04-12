import { describe, expect, it } from 'vitest';
import { buildTeamPickerSections, filterTeamPickerSections } from './teamPickerSections.js';

describe('buildTeamPickerSections', () => {
	it('returns an empty array for empty or missing input', () => {
		expect(buildTeamPickerSections([])).toEqual([]);
		expect(buildTeamPickerSections(null)).toEqual([]);
		expect(buildTeamPickerSections(undefined)).toEqual([]);
	});

	it('returns a single section when every team shares one league bucket', () => {
		const teams = [
			{ name: 'Braves', league: { id: 104, name: 'National League' } },
			{ name: 'Mets', league: { id: 104, name: 'National League' } }
		];
		const out = buildTeamPickerSections(teams);
		expect(out).toHaveLength(1);
		expect(out[0]).toMatchObject({ id: 'picker-all', label: null });
		expect(out[0].teams).toEqual(teams);
	});

	it('groups teams missing league id into one bucket (picker-all)', () => {
		const teams = [{ name: 'A' }, { name: 'B' }];
		const out = buildTeamPickerSections(teams);
		expect(out).toEqual([{ id: 'picker-all', label: null, teams }]);
	});

	it('orders American League (103) before National League (104) and sorts names', () => {
		const teams = [
			{ name: 'Yankees', league: { id: 103, name: 'American League' } },
			{ name: 'Angels', league: { id: 103, name: 'American League' } },
			{ name: 'Mets', league: { id: 104, name: 'National League' } },
			{ name: 'Braves', league: { id: 104, name: 'National League' } }
		];
		const out = buildTeamPickerSections(teams);
		expect(out).toHaveLength(2);
		expect(out[0].id).toBe('league-103');
		expect(out[0].teams.map((t) => t.name)).toEqual(['Angels', 'Yankees']);
		expect(out[1].id).toBe('league-104');
		expect(out[1].teams.map((t) => t.name)).toEqual(['Braves', 'Mets']);
	});

	it('falls back to AL/NL labels when league name is missing', () => {
		const teams = [
			{ name: 'A', league: { id: 103 } },
			{ name: 'B', league: { id: 104 } }
		];
		const out = buildTeamPickerSections(teams);
		expect(out[0].label).toBe('American League');
		expect(out[1].label).toBe('National League');
	});

	it('appends other league ids after AL and NL', () => {
		const teams = [
			{ name: 'Zulu', league: { id: 200, name: 'Winter League' } },
			{ name: 'Angels', league: { id: 103, name: 'American League' } }
		];
		const out = buildTeamPickerSections(teams);
		expect(out.map((s) => s.id)).toEqual(['league-103', 'league-200']);
		expect(out[1].label).toBe('Winter League');
		expect(out[1].teams.map((t) => t.name)).toEqual(['Zulu']);
	});
});

describe('filterTeamPickerSections', () => {
	const sections = buildTeamPickerSections([
		{ name: 'New York Yankees', teamName: 'Yankees', league: { id: 103 } },
		{ name: 'Los Angeles Angels', shortName: 'Angels', league: { id: 103 } }
	]);

	it('returns the same sections when query is empty', () => {
		expect(filterTeamPickerSections(sections, '')).toBe(sections);
		expect(filterTeamPickerSections(sections, '   ')).toBe(sections);
	});

	it('filters teams by name, teamName, locationName, shortName, and venue', () => {
		const rich = buildTeamPickerSections([
			{
				name: 'Alpha',
				locationName: 'Boston',
				venue: { name: 'Fenway Park' },
				league: { id: 103 }
			},
			{ name: 'Beta', league: { id: 103 } }
		]);
		expect(filterTeamPickerSections(rich, 'boston')).toHaveLength(1);
		expect(filterTeamPickerSections(rich, 'fenway')).toHaveLength(1);
		expect(filterTeamPickerSections(rich, 'alpha')).toHaveLength(1);
	});

	it('drops sections that have no matching teams', () => {
		const multi = buildTeamPickerSections([
			{ name: 'Solo', league: { id: 103 } },
			{ name: 'Other', league: { id: 104 } }
		]);
		expect(filterTeamPickerSections(multi, 'solo')).toHaveLength(1);
		expect(filterTeamPickerSections(multi, 'solo')[0].teams).toHaveLength(1);
	});
});
