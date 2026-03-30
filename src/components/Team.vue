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
	background-color: #fff;
	border: 1px solid #000;
	cursor: pointer;
	font-size: 18px;
	font-weight: 300;
	min-height: 44px;
	min-width: 0;
	padding: 8px 10px;
	text-align: left;
	width: 100%;
}

.team:focus {
	outline: none;
}

.team:focus-visible {
	box-shadow: 0 0 0 3px #fff, 0 0 0 5px #1a5f9e;
	outline: 2px solid transparent;
}

.team--selected {
	background-color: #f0f3f7;
	border-color: var(--theme-logo-border, #000);
	border-width: 2px;
	padding: 7px 9px;
}

@supports (background-color: color-mix(in srgb, white, black)) {
	.team--selected {
		background-color: color-mix(in srgb, var(--theme-logo-border, #1a5f9e) 14%, #fff);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--theme-logo-border, #1a5f9e) 35%, transparent);
	}
}

@media (hover: hover) and (pointer: fine) {
	.team:not(.team--selected):hover {
		background-color: #f4f6f8;
		border-color: var(--theme-logo-border, #000);
	}

	.team:not(.team--selected):hover:not(:focus-visible) {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
	}

	/* Omit box-shadow so .team--selected’s inset ring is not replaced. */
	.team.team--selected:hover {
		background-color: #e8ecf1;
	}
}

@supports (background-color: color-mix(in srgb, white, black)) {
	@media (hover: hover) and (pointer: fine) {
		.team:not(.team--selected):hover {
			background-color: color-mix(in srgb, var(--theme-logo-border, #1a5f9e) 9%, #fff);
		}

		.team:not(.team--selected):hover:not(:focus-visible) {
			box-shadow: 0 1px 3px color-mix(in srgb, var(--theme-logo-border, #000) 10%, transparent);
		}

		.team.team--selected:hover {
			background-color: color-mix(in srgb, var(--theme-logo-border, #1a5f9e) 20%, #fff);
		}

		.team.team--selected:hover:not(:focus-visible) {
			box-shadow:
				0 1px 4px color-mix(in srgb, var(--theme-logo-border, #000) 12%, transparent),
				inset 0 0 0 1px color-mix(in srgb, var(--theme-logo-border, #1a5f9e) 38%, transparent);
		}
	}
}

.team__inner {
	align-items: center;
	display: flex;
	gap: 8px;
	min-width: 0;
	width: 100%;
}

.team__name {
	flex: 1 1 auto;
	line-height: 1.25;
	min-width: 0;
	overflow-wrap: anywhere;
}

/* Sprite math is authored for a 30×30 viewport; scale from center so logos stay centered in the circle. */
.team__logo {
	border-radius: 50%;
	box-shadow: 0 0 0 1px var(--theme-logo-border, #000);
	flex-shrink: 0;
	height: 26px;
	overflow: hidden;
	position: relative;
	width: 26px;
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
	transform: translate(-50%, -50%) scale(calc(26 / 30));
	width: 30px;
}

@media (max-width: 480px) {
	.team {
		font-size: 12px;
	}

	.team__inner {
		gap: 6px;
	}

	.team__logo {
		height: 22px;
		width: 22px;
	}

	.team__logo::before {
		transform: translate(-50%, -50%) scale(calc(22 / 30));
	}
}
</style>
