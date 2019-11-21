<template>
  <div id="app">
	<div class="container">
		<baseball-card v-for="(image, i) in images" :key="i" :image="image">
		</baseball-card>
	</div>
  </div>
</template>

<script src="./assets/app.js"></script>

<style scoped>
  @import './assets/app.css';
</style>
