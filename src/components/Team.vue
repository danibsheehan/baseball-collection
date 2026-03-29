<template>
	<button class="team" :data-theme="theme || undefined" @click="searchPlayers">
		<span class="team__name">{{team.name}}</span>
		<span class="team__logo"></span>
	</button>
</template>

<script setup>
import { ref, computed } from 'vue';
import http from '../http-common';

const props = defineProps({
	team: {
		type: Object
	}
});

const emit = defineEmits(['updatePlayers', 'updateTeam']);

const players = ref([]);

const theme = computed(() => props.team.teamCode?.toLowerCase() || '');

const PEOPLE_BATCH_SIZE = 50;

function fetchPeopleByIds(personIds) {
	const unique = [...new Set(personIds.filter(Boolean))];
	const chunks = [];
	for (let i = 0; i < unique.length; i += PEOPLE_BATCH_SIZE) {
		chunks.push(unique.slice(i, i + PEOPLE_BATCH_SIZE));
	}
	return Promise.all(
		chunks.map((chunk) =>
			http.get('people', { params: { ids: chunk.join(',') } })
		)
	)
		.then((responses) => {
			const people = responses.flatMap((r) => r.data.people || []);
			return Object.fromEntries(people.map((p) => [p.id, p]));
		})
		.catch(() => ({}));
}

function searchPlayers() {
	players.value = [];
	emit('updateTeam', props.team);

	http.get(`teams/${props.team.id}/roster`)
		.then((response) => {
			const data = response.data.roster || [];
			const ids = data.map((r) => r.person?.id).filter(Boolean);
			if (!ids.length) {
				emit('updatePlayers', []);
				return;
			}
			return fetchPeopleByIds(ids).then((byId) => {
				const enriched = data.map((r) => ({
					...r,
					playerInfo: byId[r.person?.id] || {}
				}));
				players.value = enriched;
				emit('updatePlayers', enriched);
			});
		})
		.catch(() => {
			players.value = [];
			emit('updatePlayers', []);
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

.team:hover .team__name {
	display: none;
}

.team:hover .team__logo {
	display: inline-block;
}

@media (max-width: 480px) {
	.team {
		font-size: 12px;
	}
}
</style>

