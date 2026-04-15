// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayerLogo from './PlayerLogo.vue';

describe('PlayerLogo', () => {
	it('defaults to end alignment without modifier class', () => {
		const wrapper = mount(PlayerLogo);
		const el = wrapper.find('.card__logo');
		expect(el.classes()).not.toContain('card__logo--start');
	});

	it('applies start alignment class when align is start', () => {
		const wrapper = mount(PlayerLogo, {
			props: { align: 'start' }
		});
		expect(wrapper.find('.card__logo').classes()).toContain('card__logo--start');
	});
});
