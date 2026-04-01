<template>
	<button
		type="button"
		class="team"
		:class="{ 'team--selected': selected }"
		:data-theme="theme || undefined"
		:aria-current="selected ? 'true' : undefined"
		@click="searchPlayers"
	>
		<span class="team__inner">
			<span class="team__logo" aria-hidden="true"></span>
			<span class="team__name">{{ team.name }}</span>
		</span>
	</button>
</template>

<script setup>
import { ref, computed } from 'vue';
import http from '../http-common';
import {
	PEOPLE_BATCH_SIZE,
	uniquePersonIds,
	chunkPersonIds,
	peopleByIdFromResponses,
	enrichRosterWithPlayerInfo
} from '../lib/rosterPeople';

const props = defineProps({
	team: {
		type: Object
	},
	selected: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['updatePlayers', 'updateTeam', 'liveMessage', 'rosterLoading']);

const players = ref([]);

const theme = computed(() => props.team.teamCode?.toLowerCase() || '');

function fetchPeopleByIds(personIds) {
	const unique = uniquePersonIds(personIds);
	const chunks = chunkPersonIds(unique, PEOPLE_BATCH_SIZE);
	return Promise.all(
		chunks.map((chunk) =>
			http.get('people', { params: { personIds: chunk.join(',') } })
		)
	)
		.then((responses) => peopleByIdFromResponses(responses))
		.catch(() => ({}));
}

function searchPlayers() {
	players.value = [];
	emit('updateTeam', props.team);
	emit('updatePlayers', []);
	emit('liveMessage', `Loading roster for ${props.team.name}.`);
	emit('rosterLoading', true);

	http.get(`teams/${props.team.id}/roster`)
		.then((response) => {
			const data = response.data.roster || [];
			const ids = data.map((r) => r.person?.id).filter(Boolean);
			if (!ids.length) {
				emit('updatePlayers', []);
				emit('liveMessage', `No players listed for ${props.team.name}.`);
				return;
			}
			return fetchPeopleByIds(ids).then((byId) => {
				const enriched = enrichRosterWithPlayerInfo(data, byId);
				const sorted = [...enriched].sort((a, b) => {
					const an = String(a.playerInfo?.fullName ?? a.person?.fullName ?? '');
					const bn = String(b.playerInfo?.fullName ?? b.person?.fullName ?? '');
					return an.localeCompare(bn, undefined, { sensitivity: 'base' });
				});
				players.value = sorted;
				emit('updatePlayers', sorted);
				emit(
					'liveMessage',
					`Showing ${sorted.length} ${sorted.length === 1 ? 'card' : 'cards'} for ${props.team.name}.`
				);
			});
		})
		.catch(() => {
			players.value = [];
			emit('updatePlayers', []);
			emit('liveMessage', `Could not load roster for ${props.team.name}.`);
		})
		.finally(() => {
			emit('rosterLoading', false);
		});
}
</script>

<style scoped>
.team {
	align-items: center;
	background-color: var(--color-team-button);
	border: 2px solid var(--color-team-button-border);
	border-radius: 0;
	color: var(--color-team-button-text);
	cursor: pointer;
	display: flex;
	font-size: clamp(0.6875rem, 1.65vw, 0.9375rem);
	font-weight: 600;
	height: 100%;
	justify-content: center;
	min-height: 5.5rem;
	min-width: 0;
	padding: var(--space-4) var(--space-3);
	text-align: center;
	width: 100%;
}

.team:focus {
	outline: none;
}

.team:focus-visible {
	box-shadow:
		0 0 0 3px var(--color-focus-ring),
		0 0 0 5px var(--color-ui-gum);
	outline: 2px solid transparent;
}

.team--selected {
	background-color: var(--color-team-chip-selected);
	border-color: var(--theme-logo-border, var(--color-team-button-border));
	border-width: 2px;
	padding: var(--space-3) 0.625rem;
}

@supports (background-color: color-mix(in srgb, white, black)) {
	.team--selected {
		background-color: color-mix(
			in srgb,
			var(--theme-logo-border, var(--color-accent)) 14%,
			var(--color-team-selected-mix-base)
		);
		box-shadow: inset 0 0 0 1px
			color-mix(in srgb, var(--theme-logo-border, var(--color-accent)) 35%, transparent);
	}
}

@media (hover: hover) and (pointer: fine) {
	.team:not(.team--selected):hover {
		background-color: var(--color-team-button-hover);
		border-color: var(--theme-logo-border, var(--color-team-button-border));
	}

	.team:not(.team--selected):hover:not(:focus-visible) {
		box-shadow: var(--shadow-team-hover);
	}

	/* Omit box-shadow so .team--selected’s inset ring is not replaced. */
	.team.team--selected:hover {
		background-color: var(--color-team-chip-selected-hover);
	}
}

@supports (background-color: color-mix(in srgb, white, black)) {
	@media (hover: hover) and (pointer: fine) {
		.team:not(.team--selected):hover {
			background-color: color-mix(
				in srgb,
				var(--theme-logo-border, var(--color-accent)) 9%,
				var(--color-team-selected-mix-base)
			);
		}

		.team:not(.team--selected):hover:not(:focus-visible) {
			box-shadow: 0 1px 3px
				color-mix(in srgb, var(--theme-logo-border, var(--color-team-button-border)) 10%, transparent);
		}

		.team.team--selected:hover {
			background-color: color-mix(
				in srgb,
				var(--theme-logo-border, var(--color-accent)) 20%,
				var(--color-team-selected-mix-base)
			);
		}

		.team.team--selected:hover:not(:focus-visible) {
			box-shadow:
				0 1px 4px
					color-mix(in srgb, var(--theme-logo-border, var(--color-team-button-border)) 12%, transparent),
				inset 0 0 0 1px
					color-mix(in srgb, var(--theme-logo-border, var(--color-accent)) 38%, transparent);
		}
	}
}

.team__inner {
	align-items: center;
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	justify-content: center;
	min-width: 0;
	width: 100%;
}

.team__name {
	flex: 1 1 auto;
	letter-spacing: 0.02em;
	line-height: 1.25;
	min-width: 0;
	overflow-wrap: anywhere;
}

/* Sprite math is authored for a 30×30 viewport; scale from center so logos stay centered in the circle. */
.team__logo {
	background: var(--color-team-logo-well);
	border-radius: 50%;
	box-shadow: 0 0 0 2px var(--theme-logo-border, var(--color-team-button-border));
	flex-shrink: 0;
	height: 36px;
	overflow: hidden;
	position: relative;
	width: 36px;
}

.team__logo::before {
	background-image: url('../assets/mlb-logos-1.0.svg');
	background-position: var(--theme-logo-bg-pos, 0 0);
	background-repeat: no-repeat;
	background-size: 900px 900px;
	content: '';
	height: 30px;
	left: 50%;
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%) scale(calc(36 / 30));
	width: 30px;
}

@media (max-width: 480px) {
	.team {
		font-size: 12px;
		justify-content: flex-start;
		min-height: 44px;
		padding: var(--space-3) 0.625rem;
		text-align: left;
	}

	.team__inner {
		flex-direction: row;
		gap: var(--space-2);
		justify-content: flex-start;
	}

	.team__logo {
		box-shadow: 0 0 0 1px var(--theme-logo-border, var(--color-team-button-border));
		height: 26px;
		width: 26px;
	}

	.team__logo::before {
		transform: translate(-50%, -50%) scale(calc(26 / 30));
	}
}
</style>
