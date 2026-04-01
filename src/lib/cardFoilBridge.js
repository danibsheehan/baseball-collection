import { shallowRef } from 'vue';

/**
 * Active card for the shared WebGL foil overlay. CSS vars --card-tilt-x / --card-tilt-y
 * must live on `el` (e.g. .card__scene) for getComputedStyle in the overlay.
 */
export const cardFoilTarget = shallowRef(null);

/** @param {HTMLElement} el @param {string|number} id @param {boolean} manyPlayers */
export function setCardFoilTarget(el, id, manyPlayers) {
	if (!el) {
		return;
	}
	cardFoilTarget.value = { el, id, manyPlayers: Boolean(manyPlayers) };
}

/** @param {string|number} id */
export function clearCardFoilTarget(id) {
	if (cardFoilTarget.value?.id === id) {
		cardFoilTarget.value = null;
	}
}
