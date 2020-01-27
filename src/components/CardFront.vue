<template>
	<div class="card">
		<div class="card__container--front">
			<div class="card__top" :class="theme">
				<player-image :photoUrl="player.PhotoUrl" :theme="theme"></player-image>
			</div>
			<div class="card__bottom">
				<player-name :firstName="player.FirstName" :lastName="player.LastName" :theme="theme"></player-name>
				<player-logo :theme="theme"></player-logo>
			</div>
		</div>
	</div>
</template>

<script>
import PlayerImage from './PlayerImage';
import PlayerName from './PlayerName';
import PlayerLogo from './PlayerLogo';

export default {
	name: 'CardFront',
	components: {
		PlayerImage,
		PlayerName,
		PlayerLogo
	},
	props: {
		player: {
			type: Object
		},
		theme: {
			type: String
		}
	}
}
</script>

<style scoped>
.card {
	backface-visibility: hidden;
	background-color: rgba(242, 247, 245, .5);
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
}

.card__container--front {
	backface-visibility: hidden;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
	position: relative;
}

.card__top {
	border-bottom: 4px solid black;
	border-bottom-right-radius: 10px;
	border-right: 4px solid black;
	padding-bottom: 5%;
	width: 95%;
}

.card__top.ari {
	border-color: rgb(167, 30, 49);
}

.card__top.atl {
	border-color: rgb(206, 31, 67);
}

.card__top.bal,
.card__top.chw {
	border-color: rgb(0, 0, 0);
}

.card__top.bos {
	border-color: rgb(25, 44, 85);
}

.card__top.chc {
	border-color: rgb(39, 59, 129);
}

.card__top.cin {
	border-color: rgb(198, 33, 39);
}

.card__top.cle {
	border-color: rgb(226, 29, 56);
}

.card__top.col {
	border-color: rgb(55, 36, 107);
}

.card__top.det {
	border-color: rgb(24, 45, 85);
}

.card__top.hou {
	border-color: rgb(234, 110, 36);
}

.card__top.kc {
	border-color: rgb(123, 178, 221);
}

.card__top.laa {
	border-color: rgb(186, 0, 33);
}

.card__top.lad {
	border-color: rgb(0, 90, 156);
}

.card__top.mia {
	border-color: rgb(242, 103, 34);
}

.card__top.mil {
	border-color: rgb(181, 146, 47);
}

.card__top.min {
	border-color: rgb(211, 30, 71);
}

.card__top.nym {
	border-color: rgb(255, 89, 16);
}

.card__top.nyy {
	border-color: rgb(196, 206, 211);
}

.card__top.oak {
	border-color: rgb(238, 178, 30);
}

.card__top.phi {
	border-color: rgb(231, 29, 42);
}

.card__top.pit {
	border-color: rgb(253, 183, 36);
}

.card__top.sd {
	border-color: rgb(30, 49, 96);
}

.card__top.sf {
	border-color: rgb(241, 91, 40);
}

.card__top.sea {
	border-color: rgb(2, 93, 93);
}

.card__top.stl {
	border-color: rgb(196, 32, 59);
}

.card__top.tb {
	border-color: rgb(144, 188, 228);
}

.card__top.tex {
	border-color: rgb(192, 33, 38);
}

.card__top.tor {
	border-color: rgb(18, 75, 141);
}

.card__top.wsh {
	border-color: rgb(170, 30, 34);
}

.card__bottom {
	height: 100%;
	position: relative;
}
</style>
