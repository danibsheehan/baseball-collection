/** When set on `<html>`, CardFront dials back CSS `::after` sheen (WebGL foil is active). */
export const CARD_FOIL_WEBGL_ATTR = 'data-card-foil-webgl';

export function setCardFoilWebglDomActive(active: boolean) {
	if (typeof document === 'undefined') {
		return;
	}
	const root = document.documentElement;
	if (active) {
		root.setAttribute(CARD_FOIL_WEBGL_ATTR, '');
	} else {
		root.removeAttribute(CARD_FOIL_WEBGL_ATTR);
	}
}
