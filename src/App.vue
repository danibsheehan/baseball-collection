<template>
	<div id="app">
		<div class="album__search">
			<div class="teams__container">
				<team v-for="(team, i) in teams" :key="i" :team="team" @update="loadPlayers"></team>
			</div>
		</div>
		<div class="album__results">
			<baseball-card v-for="player in players" :key="player.PlayerID" :player="player">
			</baseball-card>
		</div>
	</div>
</template>

<script src="./components/js/app.js"></script>

<style scoped>
	@import './components/css/app.css';
</style>
