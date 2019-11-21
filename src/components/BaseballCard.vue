<template>
	<div class="card__container" @click="flipCard(image)">
		<div class="card__contaner--front" v-if="!image.showBack">
			<img :src="image.urls.small" :alt="image.alt_description" class="card__image"/>
			<span class="card__description">{{image.description}}</span>
		</div>
		<div class="card__container--back" v-if="image.showBack">
			<span class="card__tag" v-for="(tag, i) in image.tags" :key="i">{{tag.title}}</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'BaseballCard',
		props: {
			image: {
				type: Object
			}
		},
		methods: {
			flipCard(image) {
				console.log('huh', image);
				image.showBack = !image.showBack;
			}
		}
	}
</script>

<style scoped>
	.card__container {
		margin: 15px;
		position: relative;
		width: 30%;
	}

	.card__image {
		height: 100%;
		object-fit: cover;
		width: 100%;
	}

	.card__description {
		background-color: rgba(243, 245, 242, .9);
		bottom: 0;
		display: inline-block;
		left: 0;
		position: absolute;
		width: 100%;
	}
</style>
