// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PlayerName from './PlayerName.vue';

describe('PlayerName', () => {
	it('renders the full name in uppercase styling container', () => {
		const wrapper = mount(PlayerName, {
			props: { fullName: 'Shohei Ohtani' }
		});
		expect(wrapper.find('.card__name--full').text()).toBe('Shohei Ohtani');
	});
});
