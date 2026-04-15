// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Team from './Team.vue';

const mockGet = vi.hoisted(() => vi.fn());

vi.mock('../http-common', () => ({
	default: {
		get: mockGet
	}
}));

const yankees = { id: 147, name: 'Yankees', teamCode: 'NYY' };

describe('Team', () => {
	beforeEach(() => {
		mockGet.mockReset();
	});

	it('renders the team name', () => {
		const wrapper = mount(Team, { props: { team: yankees } });
		expect(wrapper.find('.team__name').text()).toBe('Yankees');
	});

	it('marks the button selected with aria-current when selected', () => {
		const wrapper = mount(Team, {
			props: { team: yankees, selected: true }
		});
		expect(wrapper.find('button').classes()).toContain('team--selected');
		expect(wrapper.find('button').attributes('aria-current')).toBe('true');
	});

	it('sets data-theme from teamCode', () => {
		const wrapper = mount(Team, { props: { team: yankees } });
		expect(wrapper.find('button').attributes('data-theme')).toBe('nyy');
	});

	it('loads roster and emits sorted players', async () => {
		mockGet.mockImplementation((url: string) => {
			if (url.includes('roster')) {
				return Promise.resolve({
					data: {
						roster: [
							{ person: { id: 2, fullName: 'B Player' } },
							{ person: { id: 1, fullName: 'A Player' } }
						]
					}
				});
			}
			if (url === 'people') {
				return Promise.resolve({
					data: {
						people: [
							{ id: 1, fullName: 'A Player' },
							{ id: 2, fullName: 'B Player' }
						]
					}
				});
			}
			return Promise.reject(new Error(`Unexpected URL: ${url}`));
		});

		const wrapper = mount(Team, { props: { team: yankees } });
		await wrapper.find('button').trigger('click');
		await flushPromises();

		const updates = wrapper.emitted('updatePlayers');
		expect(updates?.length).toBeGreaterThan(0);
		const last = updates?.at(-1)?.[0] as Array<{ person?: { fullName?: string } }>;
		expect(last?.map((r) => r.person?.fullName)).toEqual(['A Player', 'B Player']);
		expect(wrapper.emitted('rosterLoading')?.flat().includes(false)).toBe(true);
	});

	it('uses singular copy when only one card is returned', async () => {
		mockGet.mockImplementation((url: string) => {
			if (url.includes('roster')) {
				return Promise.resolve({
					data: { roster: [{ person: { id: 10, fullName: 'Solo' } }] }
				});
			}
			if (url === 'people') {
				return Promise.resolve({ data: { people: [{ id: 10, fullName: 'Solo' }] } });
			}
			return Promise.reject(new Error(`Unexpected URL: ${url}`));
		});

		const wrapper = mount(Team, { props: { team: yankees } });
		await wrapper.find('button').trigger('click');
		await flushPromises();

		expect(String(wrapper.emitted('liveMessage')?.at(-1)?.[0])).toContain('1 card for');
	});

	it('emits an empty roster when the API returns no people ids', async () => {
		mockGet.mockResolvedValueOnce({ data: { roster: [{ person: {} }] } });

		const wrapper = mount(Team, { props: { team: yankees } });
		await wrapper.find('button').trigger('click');
		await flushPromises();

		const lastPlayers = wrapper.emitted('updatePlayers')?.at(-1)?.[0];
		expect(lastPlayers).toEqual([]);
		expect(String(wrapper.emitted('liveMessage')?.at(-1)?.[0])).toContain('No pasteboards');
	});

	it('emits empty players when roster request fails', async () => {
		mockGet.mockRejectedValueOnce(new Error('network'));

		const wrapper = mount(Team, { props: { team: yankees } });
		await wrapper.find('button').trigger('click');
		await flushPromises();

		expect(wrapper.emitted('updatePlayers')?.at(-1)?.[0]).toEqual([]);
		expect(String(wrapper.emitted('liveMessage')?.at(-1)?.[0])).toContain('Could not load');
	});
});
