// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusPill from './StatusPill.vue';

describe('StatusPill', () => {
	it('renders the label', () => {
		const wrapper = mount(StatusPill, {
			props: { label: 'Active roster' }
		});
		expect(wrapper.get('[data-testid="pill"]').text()).toBe('Active roster');
	});

	it('applies active class when active is true', () => {
		const wrapper = mount(StatusPill, {
			props: { label: 'Live', active: true }
		});
		expect(wrapper.classes()).toContain('active');
	});
});
