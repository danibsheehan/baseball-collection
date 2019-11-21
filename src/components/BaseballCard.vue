<template>
	<div class="card__container" @click="flipCard(player)">
		<div class="card__container--front">
			<img :src="player.PhotoUrl" class="card__image"/>
			<div class="card__team">
				<div class="card__team--letter" v-for="(letter, i) in team" :key="i">{{letter}}</div>
			</div>
			<div class="card__name">
				<div class="card__name--last">{{player.LastName}}</div>
				<div class="card__name--first">{{player.FirstName}}</div>
			</div>
		</div>
		<!-- <div class="card__container--back" v-if="image.showBack">
			<span class="card__tag" v-for="(tag, i) in image.tags" :key="i">{{tag.title}}</span>
		</div> -->
	</div>
</template>

<script>
	export default {
		name: 'BaseballCard',
		props: {
			player: {
				type: Object
			},
			team: {
				type: Array
			}
		},
		data() {
			this.team = this.player.Team.split('');
			return this.team;
		},
		mounted() {

		}
		// methods: {
		// 	flipCard(image) {
		// 		console.log('huh', player);
		// 		image.showBack = !image.showBack;
		// 	}
		// }
	}
</script>

<style scoped>
	.card__container {
		box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.6);
		margin: 15px;
		max-width: 500px;
		position: relative;
		width: 20%;
	}

	.card__container--front {
		display: flex;
		flex-wrap: wrap;
	}

	.card__image {
		background: url('../assets/baseball-field.jpg');
		border-bottom-right-radius: 10px;
		min-height: 200px;
		width: 70%;
	}

	.card__team {
		display: flex;
		flex-direction: column;
		font-size: 28px;
		justify-content: space-around;
		width: 25%;
	}

	.card__name {
		background-color: rgba(243, 245, 242, .9);
		text-align: left;
		width: 100%;
	}

	.card__name--first,
	.card__name--last {
		padding-left: 10%;
	}

	.card__name--last {
		font-size: 28px;
	}

	.card__name--first {
		font-size: 20px;
	}
</style>
