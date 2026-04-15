// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

vi.mock('../lib/useCardTilt', () => ({
	useCardTilt: () => ({
		tiltStyle: {},
		onPointerEnter: () => {},
		onPointerMove: () => {},
		onPointerLeave: () => {},
		onPointerDown: () => {}
	})
}));

import * as foilBridge from '../lib/cardFoilBridge';
import BaseballCard from './BaseballCard.vue';

const player = {
	person: { id: 501, fullName: 'Test Hitter' },
	playerInfo: {
		primaryPosition: { name: 'First Base' }
	}
};

describe('BaseballCard', () => {
	beforeEach(() => {
		if (foilBridge.cardFoilTarget.value?.id === 501) {
			foilBridge.clearCardFoilTarget(501);
		}
		foilBridge.cardFoilTarget.value = null;
	});

	it('exposes an accessible flip control with a descriptive label', () => {
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club', theme: 'bos' },
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		const flip = wrapper.find('[role="button"]');
		expect(flip.attributes('aria-label')).toContain('Test Hitter');
		expect(flip.attributes('aria-pressed')).toBe('false');
	});

	it('toggles flip state on click', async () => {
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		const flip = wrapper.find('[role="button"]');
		await flip.trigger('click');
		expect(flip.attributes('aria-pressed')).toBe('true');
		expect(flip.classes()).toContain('card__container--flipped');
		await flip.trigger('click');
		expect(flip.attributes('aria-pressed')).toBe('false');
	});

	it('flips when Enter is pressed while focused', async () => {
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		const flip = wrapper.find('[role="button"]');
		await flip.trigger('focus');
		await flip.trigger('keydown', { key: 'Enter' });
		expect(flip.attributes('aria-pressed')).toBe('true');
	});

	it('flips when Space is pressed while focused', async () => {
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		const flip = wrapper.find('[role="button"]');
		await flip.trigger('keydown', { key: ' ' });
		expect(flip.attributes('aria-pressed')).toBe('true');
	});

	it('claims the foil target when the scene receives pointer enter', async () => {
		const spy = vi.spyOn(foilBridge, 'setCardFoilTarget');
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		await wrapper.find('.card__scene').trigger('pointerenter');
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	it('clears foil after pointer leave when nothing inside the scene stays focused or hovered', async () => {
		const clearSpy = vi.spyOn(foilBridge, 'clearCardFoilTarget');
		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			attachTo: document.body,
			global: { stubs: { CardFront: true, CardBack: true, CardFoilGl: true } }
		});
		const sceneEl = wrapper.find('.card__scene').element as HTMLElement;
		vi.spyOn(sceneEl, 'matches').mockImplementation(() => false);

		await wrapper.find('.card__scene').trigger('pointerenter');
		await wrapper.find('.card__scene').trigger('pointerleave');
		await flushPromises();

		expect(clearSpy).toHaveBeenCalledWith(501);
		clearSpy.mockRestore();
		wrapper.unmount();
	});

	it('renders foil overlay when this card owns the foil target', async () => {
		const scene = document.createElement('div');
		foilBridge.cardFoilTarget.value = { el: scene, id: 501, manyPlayers: false };

		const wrapper = mount(BaseballCard, {
			props: { player, teamName: 'Club' },
			attachTo: document.body,
			global: {
				stubs: {
					CardFront: true,
					CardBack: true,
					CardFoilGl: {
						template: '<div class="foil-stub" />'
					}
				}
			}
		});

		await wrapper.vm.$nextTick();
		expect(wrapper.find('.foil-stub').exists()).toBe(true);
		wrapper.unmount();
	});
});
