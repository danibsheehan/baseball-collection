// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CardBack from './CardBack.vue';

describe('CardBack', () => {
	it('applies the large-roster class when manyPlayers is true', () => {
		const wrapper = mount(CardBack, {
			props: {
				player: { person: { fullName: 'A' }, jerseyNumber: '1' },
				playerInfo: { fullName: 'A' },
				teamName: 'Club',
				manyPlayers: true
			},
			global: {
				stubs: { PlayerInfo: true, PlayerLogo: true }
			}
		});
		expect(wrapper.find('.card').classes()).toContain('card--large-roster');
	});

	it('forwards props to PlayerInfo', () => {
		const PlayerInfoStub = {
			name: 'PlayerInfo',
			props: ['playerInfo', 'teamName', 'fullName', 'jerseyNumber'],
			template: '<div class="pi-stub" />'
		};
		const wrapper = mount(CardBack, {
			props: {
				player: { person: { fullName: 'Babe Ruth' }, jerseyNumber: '3' },
				playerInfo: { fullName: 'George Ruth' },
				teamName: 'Yankees'
			},
			global: {
				stubs: { PlayerInfo: PlayerInfoStub, PlayerLogo: true }
			}
		});
		const stub = wrapper.findComponent({ name: 'PlayerInfo' });
		expect(stub.props('teamName')).toBe('Yankees');
		expect(stub.props('fullName')).toBe('Babe Ruth');
		expect(stub.props('jerseyNumber')).toBe('3');
	});
});
