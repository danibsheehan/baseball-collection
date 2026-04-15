// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayerImage from './PlayerImage.vue';

describe('PlayerImage', () => {
	const originalIO = globalThis.IntersectionObserver;

	afterEach(() => {
		if (originalIO === undefined) {
			Reflect.deleteProperty(globalThis, 'IntersectionObserver');
		} else {
			globalThis.IntersectionObserver = originalIO;
		}
	});

	it('does not render an image when playerId is missing', () => {
		const wrapper = mount(PlayerImage, {
			props: { imageDescription: 'Someone' }
		});
		expect(wrapper.find('img').exists()).toBe(false);
	});

	it('uses MLB headshot URL and alt when porthole is true', async () => {
		const wrapper = mount(PlayerImage, {
			props: {
				playerId: 660271,
				imageDescription: 'Ronald Acuña Jr.',
				porthole: true
			}
		});
		await wrapper.vm.$nextTick();
		const img = wrapper.find('img');
		expect(img.exists()).toBe(true);
		expect(img.attributes('src')).toBe('https://img.mlbstatic.com/mlb/images/players/head_shot/660271.jpg');
		expect(img.attributes('alt')).toBe('Headshot of Ronald Acuña Jr.');
		expect(wrapper.find('.card-porthole').exists()).toBe(true);
	});

	it('loads without an observer when IntersectionObserver is unavailable', async () => {
		Reflect.deleteProperty(globalThis, 'IntersectionObserver');

		const wrapper = mount(PlayerImage, {
			props: { playerId: 123, porthole: false }
		});
		await wrapper.vm.$nextTick();
		const img = wrapper.find('img');
		expect(img.exists()).toBe(true);
		expect(img.attributes('loading')).toBe('lazy');
	});

	it('reveals the image after the observer reports intersection', async () => {
		/* eslint-disable no-unused-vars -- test double matches DOM IntersectionObserver signature */
		class MockIntersectionObserver implements IntersectionObserver {
			readonly root: Element | Document | null = null;
			readonly rootMargin = '';
			readonly thresholds: ReadonlyArray<number> = [];
			private readonly callback: (
				entries: IntersectionObserverEntry[],
				observer: IntersectionObserver
			) => void;
			constructor(callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void) {
				this.callback = callback;
			}
			disconnect() {
				/* noop */
			}
			observe(target: Element) {
				this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
			}
			takeRecords(): IntersectionObserverEntry[] {
				return [];
			}
			unobserve() {
				/* noop */
			}
		}
		/* eslint-enable no-unused-vars */
		globalThis.IntersectionObserver =
			MockIntersectionObserver as unknown as typeof IntersectionObserver;

		const wrapper = mount(PlayerImage, {
			props: { playerId: 99, porthole: false }
		});
		expect(wrapper.find('img').exists()).toBe(false);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('img').exists()).toBe(true);
	});
});
