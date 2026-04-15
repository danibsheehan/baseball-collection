// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CardFront from './CardFront.vue';

describe('CardFront', () => {
	it('renders an empty name when the roster name is blank', () => {
		const wrapper = mount(CardFront, {
			props: { player: { person: { id: 1, fullName: '' } } },
			global: { stubs: { PlayerImage: true, PlayerLogo: true } }
		});
		expect(wrapper.find('.card__1959-name').text()).toBe('');
	});

	it('passes player data into PlayerImage and shows the name', () => {
		const wrapper = mount(CardFront, {
			props: {
				player: { person: { id: 42, fullName: 'Casey At Bat' } },
				teamName: 'Mudville',
				positionName: 'Pinch Hitter'
			},
			global: {
				stubs: {
					PlayerImage: {
						props: ['playerId', 'imageDescription', 'porthole'],
						template: '<div class="stub-player-image" />'
					},
					PlayerLogo: true
				}
			}
		});

		expect(wrapper.find('.card__1959-name').text()).toBe('Casey At Bat');
		expect(wrapper.find('.stub-player-image').exists()).toBe(true);
		expect(wrapper.find('.card__1959-pos').text()).toBe('Pinch Hitter');
		expect(wrapper.find('.card__1959-team').text()).toBe('Mudville');
	});
});
