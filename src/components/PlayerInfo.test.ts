// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayerInfo from './PlayerInfo.vue';

const baseInfo = {
	fullName: 'Sample Player',
	height: `6' 2"`,
	weight: '210 lbs',
	primaryPosition: { name: 'Outfielder' },
	batSide: { description: 'Right' },
	pitchHand: { description: 'Right' },
	birthDate: '1995-04-15',
	birthCity: 'Miami',
	birthStateProvince: 'FL',
	birthCountry: 'USA',
	mlbDebutDate: '2018-04-25',
	nickName: 'Flash',
	primaryNumber: '27'
};

describe('PlayerInfo', () => {
	it('renders nothing when playerInfo is missing', () => {
		const wrapper = mount(PlayerInfo, {
			props: { teamName: 'Braves' }
		});
		expect(wrapper.find('.player__back').exists()).toBe(false);
	});

	it('shows formatted birth date and hometown', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: baseInfo,
				teamName: 'Braves',
				fullName: 'Sample Player'
			}
		});
		expect(wrapper.find('.player__name').text()).toContain('SAMPLE PLAYER');
		expect(wrapper.text()).toContain('APR 15, 1995');
		expect(wrapper.text()).toContain('Miami, FL, USA');
	});

	it('formats uniform from jerseyNumber prop', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: { ...baseInfo, primaryNumber: '99' },
				teamName: 'Braves',
				jerseyNumber: '12'
			}
		});
		expect(wrapper.text()).toContain('#12');
	});

	it('shows nickname row when nickName is present', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: baseInfo,
				teamName: 'Braves'
			}
		});
		expect(wrapper.text()).toContain('FLASH');
	});

	it('returns raw birth dates when the month is out of range', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: { ...baseInfo, birthDate: '2000-13-40' },
				teamName: 'Club'
			}
		});
		expect(wrapper.text()).toContain('2000-13-40');
	});

	it('uppercases debut strings that are not ISO dates', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: { ...baseInfo, mlbDebutDate: 'Called Up' },
				teamName: 'Club'
			}
		});
		expect(wrapper.text()).toContain('CALLED UP');
	});

	it('returns raw debut values when the month is out of range', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: { ...baseInfo, mlbDebutDate: '2000-13-01' },
				teamName: 'Club'
			}
		});
		expect(wrapper.text()).toContain('2000-13-01');
	});

	it('hides the uniform row when no number is available', () => {
		const wrapper = mount(PlayerInfo, {
			props: {
				playerInfo: {
					...baseInfo,
					primaryNumber: '',
					nickName: ''
				},
				teamName: 'Braves',
				jerseyNumber: ''
			}
		});
		expect(wrapper.text()).not.toContain('#');
	});
});
