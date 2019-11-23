<template>
	<div id="app">
		<div class="album__search">
			<h1 class="album__search--title">Pick a Team and Get Your Cards!</h1>
			<div class="teams__container">
				<team v-for="(team, i) in teams" :key="i" :team="team" @update="loadPlayers"></team>
			</div>
		</div>
		<div class="album__results">
			<h2 class="album__results--title" v-if="players.length">Your Baseball Cards</h2>
			<baseball-card v-for="player in players" :key="player.PlayerID" :player="player">
			</baseball-card>
		</div>
	</div>
</template>

<script src="./components/js/app.js"></script>

<style scoped>
	@import './components/css/app.css';
</style>
