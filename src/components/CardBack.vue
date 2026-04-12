<template>
	<div class="card" :class="{ 'card--large-roster': manyPlayers }">
		<div class="card__container--back">
			<div class="card__art-panel" aria-hidden="true">
				<PlayerLogo />
			</div>
			<PlayerInfo
				:playerInfo="playerInfo"
				:teamName="teamName"
				:fullName="player?.person?.fullName"
				:jerseyNumber="player?.jerseyNumber"
			/>
		</div>
	</div>
</template>

<script setup>
import PlayerInfo from './PlayerInfo.vue';
import PlayerLogo from './PlayerLogo.vue';

defineProps({
	player: {
		type: Object
	},
	playerInfo: {
		type: Object,
		default: () => ({})
	},
	teamName: {
		type: String
	},
	manyPlayers: {
		type: Boolean,
		default: false
	}
});
</script>

<style scoped>
.card {
	backface-visibility: hidden;
	background-color: var(--card-back-paper);
	background-image:
		radial-gradient(ellipse 92% 48% at 50% -10%, var(--card-back-paper-bloom), transparent 48%),
		radial-gradient(ellipse 84% 44% at 50% 108%, var(--card-back-paper-honey), transparent 36%),
		radial-gradient(ellipse 72% 40% at 100% 100%, var(--card-back-paper-edge), transparent 36%),
		radial-gradient(ellipse 72% 40% at 0% 100%, var(--card-back-paper-edge), transparent 34%),
		linear-gradient(
			198deg,
			var(--card-back-paper-raised) 0%,
			var(--card-back-paper) 52%,
			var(--card-back-paper-shade) 100%
		);
	border-radius: 10px;
	box-shadow:
		inset 0 0 0 1px var(--card-back-rule),
		inset 0 1px 0 rgba(255, 255, 255, 0.38);
	height: 100%;
	left: 0;
	overflow: hidden;
	position: absolute;
	top: 0;
	transform: rotateY(180deg);
	width: 100%;
}

/* Light grain — keep low so the face stays airy */
.card::before {
	background-image:
		repeating-linear-gradient(
			0deg,
			transparent 0,
			transparent 4px,
			rgba(120, 100, 80, 0.012) 4px,
			rgba(120, 100, 80, 0.012) 5px
		),
		repeating-linear-gradient(
			90deg,
			transparent 0,
			transparent 4px,
			rgba(120, 100, 80, 0.01) 4px,
			rgba(120, 100, 80, 0.01) 5px
		);
	border-radius: 10px;
	content: "";
	inset: 0;
	opacity: 0.38;
	pointer-events: none;
	position: absolute;
	z-index: 0;
}

.card--large-roster::before {
	opacity: 0.22;
}

@media (prefers-color-scheme: dark) {
	.card,
	.card.card--large-roster {
		box-shadow:
			inset 0 0 0 1px var(--card-back-rule),
			inset 0 1px 0 rgba(255, 255, 255, 0.11);
	}

	.card::before {
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent 0,
				transparent 4px,
				rgba(255, 252, 248, 0.028) 4px,
				rgba(255, 252, 248, 0.028) 5px
			),
			repeating-linear-gradient(
				90deg,
				transparent 0,
				transparent 4px,
				rgba(255, 252, 248, 0.022) 4px,
				rgba(255, 252, 248, 0.022) 5px
			);
		opacity: 0.35;
	}

	.card--large-roster::before {
		opacity: 0.2;
	}
}

.card--large-roster {
	box-shadow:
		inset 0 0 0 1px var(--card-back-rule),
		inset 0 1px 0 rgba(255, 255, 255, 0.38);
}

.card__container--back {
	box-sizing: border-box;
	container-name: card-back;
	container-type: size;
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	overflow: hidden;
	padding: 0.3rem 0.4rem 0.35rem;
	position: relative;
	z-index: 1;
}

/* Corner “cartoon block” substitute — ruled box + team mark */
.card__art-panel {
	align-items: center;
	background: var(--card-back-paper-raised);
	border: 1px solid var(--card-back-rule-strong);
	border-radius: 2px;
	box-sizing: border-box;
	display: flex;
	flex-shrink: 0;
	height: 38px;
	justify-content: center;
	left: 6px;
	position: absolute;
	top: 6px;
	width: 38px;
}

.card__art-panel :deep(.card__logo) {
	background-color: transparent;
	border-width: 1px;
	bottom: auto;
	left: auto;
	position: relative;
	right: auto;
	top: auto;
}
</style>
