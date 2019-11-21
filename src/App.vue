<template>
  <div id="app">
	<div class="container">
		<baseball-card v-for="(player, i) in players" :key="i" :player="player">
		</baseball-card>
	</div>
  </div>
</template>

<script src="./assets/app.js"></script>

<style scoped>
  @import './assets/app.css';
</style>
