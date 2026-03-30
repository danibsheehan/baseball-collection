<template>
	<button type="button" class="team" :data-theme="theme || undefined" @click="searchPlayers">
		<span class="team__name">{{ team.name }}</span>
		<span class="team__logo" aria-hidden="true"></span>
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
	}
});

const emit = defineEmits(['updatePlayers', 'updateTeam', 'liveMessage']);

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
	emit('liveMessage', `Loading roster for ${props.team.name}.`);

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
		});
}
</script>

<style scoped>
.team {
	background-color: white;
	border: 1px solid black;
	font-size: 18px;
	font-weight: 250;
	height: 40px;
	padding: 10px;
	position: relative;
	width: 33%;
}

.team:focus {
	outline: none;
}

.team:focus-visible {
	box-shadow: 0 0 0 3px #fff, 0 0 0 5px #1a5f9e;
	outline: 2px solid transparent;
}

.team__logo,
.team__name {
	left: 50%;
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
}

.team__name {
	width: 100%;
}

.team__logo {
	background-image: url('../assets/mlb-logos-1.0.svg');
	background-position: var(--theme-logo-bg-pos, 0 0);
	display: none;
	padding-bottom: 30px;
	width: 30px;
}

.team:hover .team__name,
.team:focus-within .team__name {
	display: none;
}

.team:hover .team__logo,
.team:focus-within .team__logo {
	display: inline-block;
}

@media (max-width: 480px) {
	.team {
		font-size: 12px;
	}
}
</style>

