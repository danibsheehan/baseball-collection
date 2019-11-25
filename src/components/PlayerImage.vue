<template>
	<span class="card__image" :class="theme">
		<img :src="photoUrl" class="card__image--player"/>
	</span>
</template>

<script>
export default {
	name: 'PlayerImage',
	props: {
		photoUrl: {
			type: String
		},
		theme: {
			type: String
		}
	}
}
</script>

<style scoped>
.card__image {
	border-bottom: 2px solid black;
	border-bottom-right-radius: 10px;
	border-right: 2px solid black;
	color: rgb(240, 243, 247);
	float: left;
	min-height: 200px;
	position: relative;
	width: 95%;
}

.card__image::after {
	border-bottom-right-radius: 10px;
	box-shadow: 30px 0 25px -20px inset, -30px 0 25px -20px inset;
	content: "";
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
	width: 100%;
}

.card__image.ari {
	border-color: rgb(227, 212, 173);
	color: rgba(63, 194, 204, .4);
}

.card__image.atl {
	border-color: rgb(234, 170, 0);
	color: rgba(22, 40, 79, .4);
}

.card__image.bal {
	border-color: rgb(221, 73, 38);
	color: rgba(162, 170, 173, .4);
}

.card__image.bos {
	border-color: rgb(189, 49, 57);
	color: rgba(25, 44, 85, .4);
}

.card__image.chw {
	border-color: rgb(196, 206, 211);
	color: rgba(0, 0, 0, .4);
}

.card__image.chc {
	border-color: rgb(204, 52, 51);
	color: rgba(39, 59, 129, .4);
}

.card__image.cin {
	border-color: rgb(0, 0, 0);
	color: rgba(0, 0, 0, .4);
}

.card__image.cle {
	border-color: rgb(26, 46, 90);
	color: rgba(26, 46, 90, .4);
}

.card__image.col {
	border-color: rgb(0, 0, 0);
	color: rgba(196, 206, 211, .4);
}

.card__image.det {
	border-color: rgb(242, 103, 34);
	color: rgba(24, 45, 85, .4);
}

.card__image.hou {
	border-color: rgb(229, 114, 0);
	color: rgb(187, 188, 188);
}

.card__image.kc {
	border-color: rgb(192, 153, 90);
	color: rgba(23, 72, 133, .4);
}

.card__image.laa {
	border-color: rgb(134, 38, 51);
	color: rgb(196, 206, 212);
}

.card__image.lad {
	border-color: rgb(239, 62, 66);
	color: rgb(0, 90, 156)
}

.card__image.mia {
	border-color: rgb(254, 209, 7);
	color: rgb(30, 118, 189, .4);
}

.card__image.mil {
	border-color: rgb(26, 37, 80);
	color: rgba(26, 37, 80, .4);
}

.card__image.min {
	border-color: rgb(207, 172, 122);
	color: rgba(26, 46, 90, .4);
}

.card__image.nym {
	border-color: rgb(0, 45, 114);
	color: rgba(0, 45, 114, .4);
}

.card__image.nyy {
	border-color: rgb(18, 36, 72);
	color: rgba(18, 36, 72, .4);
}

.card__image.oak {
	border-color: rgb(1, 56, 49);
	color: rgba(1, 56, 49, .4);
}

.card__image.phi {
	border-color: rgb(40, 73, 153);
	color: rgba(40, 73, 153, .4);
}

.card__image.pit {
	border-color: rgb(0, 0, 0);
	color: rgba(0, 0, 0, .4);
}

.card__image.sd {
	border-color: rgb(30, 49, 96);
	color: rgba(30, 49, 96, .4);
}

.card__image.sf {
	border-color: rgb(139, 111, 78);
	color: rgba(230, 216, 175, .4);
}

.card__image.sea {
	border-color: rgb(255, 197, 40);
	color: rgb(196, 206, 211);
}

.card__image.stl {
	border-color: rgb(253, 218);
	color: rgba(34, 32, 95, .4);
}

.card__image.tb {
	border-color: rgb(245, 209, 49);
	color: rgba(27, 47, 91, .4);
}

.card__image.tex {
	border-color: rgb(35, 57, 116);
	color: rgba(35, 57, 116, .4);
}

.card__image.tor {
	border-color: rgb(231, 44, 37);
	color: rgba(30, 46, 92, .4);
}

.card__image.wsh {
	border-color: rgb(33, 39, 89);
	color: rgba(33, 39, 89, .4);
}

.card__image--player {
	height: 100%;
	left: 0;
	position: absolute;
	object-fit: contain;
	top: 0;
	width: 100%;
}
</style>
