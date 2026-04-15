import { shallowRef, type ShallowRef } from 'vue';

export type CardFoilTargetValue = {
	el: HTMLElement;
	id: string | number;
	manyPlayers: boolean;
};

/**
 * Active card for the shared WebGL foil overlay. CSS vars --card-tilt-x / --card-tilt-y
 * must live on `el` (e.g. .card__scene) for getComputedStyle in the overlay.
 */
export const cardFoilTarget: ShallowRef<CardFoilTargetValue | null> = shallowRef(null);

export function setCardFoilTarget(
	el: HTMLElement | null | undefined,
	id: string | number,
	manyPlayers: boolean
) {
	if (!el) {
		return;
	}
	cardFoilTarget.value = { el, id, manyPlayers: Boolean(manyPlayers) };
}

export function clearCardFoilTarget(id: string | number) {
	if (cardFoilTarget.value?.id === id) {
		cardFoilTarget.value = null;
	}
}
