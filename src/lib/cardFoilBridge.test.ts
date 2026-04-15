// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cardFoilTarget, clearCardFoilTarget, setCardFoilTarget } from './cardFoilBridge';

describe('cardFoilBridge', () => {
	beforeEach(() => {
		cardFoilTarget.value = null;
	});

	afterEach(() => {
		cardFoilTarget.value = null;
	});

	it('records the active foil target', () => {
		const el = document.createElement('div');
		setCardFoilTarget(el, 42, true);
		expect(cardFoilTarget.value).toEqual({ el, id: 42, manyPlayers: true });
	});

	it('ignores setCardFoilTarget when the element is missing', () => {
		setCardFoilTarget(undefined, 1, false);
		expect(cardFoilTarget.value).toBeNull();
	});

	it('clears the target when the id matches', () => {
		const el = document.createElement('div');
		setCardFoilTarget(el, 7, false);
		clearCardFoilTarget(7);
		expect(cardFoilTarget.value).toBeNull();
	});

	it('does not clear when the id does not match', () => {
		const el = document.createElement('div');
		setCardFoilTarget(el, 3, false);
		clearCardFoilTarget(99);
		expect(cardFoilTarget.value?.id).toBe(3);
	});
});
