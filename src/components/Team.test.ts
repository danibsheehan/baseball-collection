// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Team from './Team.vue';

const yankees = { id: 147, name: 'Yankees', teamCode: 'NYY' };

describe('Team', () => {
	it('renders the team name', () => {
		const wrapper = mount(Team, { props: { team: yankees } });
		expect(wrapper.find('.team__name').text()).toBe('Yankees');
	});

	it('marks the button selected with aria-current when selected', () => {
		const wrapper = mount(Team, {
			props: { team: yankees, selected: true }
		});
		expect(wrapper.find('button').classes()).toContain('team--selected');
		expect(wrapper.find('button').attributes('aria-current')).toBe('true');
	});

	it('sets data-theme from teamCode', () => {
		const wrapper = mount(Team, { props: { team: yankees } });
		expect(wrapper.find('button').attributes('data-theme')).toBe('nyy');
	});

	it('emits select with the team on click', async () => {
		const wrapper = mount(Team, { props: { team: yankees } });
		await wrapper.find('button').trigger('click');
		expect(wrapper.emitted('select')?.[0]).toEqual([yankees]);
	});
});
