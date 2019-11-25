<template>
	<div class="card__name" :class="theme">
		<span class="card__name--last">{{lastName}}</span>
		<span class="card__name--first">{{firstName}}</span>
	</div>
</template>

<script>
export default {
	name: 'PlayerName',
	props: {
		firstName: {
			type: String
		},
		lastName: {
			type: String
		},
		theme: {
			type: String
		}
	}
}
</script>

<style scoped>
.card__name {
	display: flex;
	flex-direction: column;
	margin: 15px 0 0;
	text-align: left;
	text-transform: uppercase;
	width: 100%;
}

.card__name--first {
	font-size: 16px;
	padding-left: 10%;
}

.card__name--last {
	font-size: 22px;
	font-weight: 700;
	letter-spacing: 1.5px;
	padding-left: 5%;
}

.card__name.atl {
	color: rgb(22, 40, 79);
}

.card__name.bos {
	color: rgb(25, 44, 85);
}

.card__name.ari,
.card__name.bal,
.card__name.chw,
.card__name.cin,
.card__name.col,
.card__name.mia,
.card__name.pit,
.card__name.sf {
	color: rgb(0, 0, 0);
}

.card__name.chc {
	color: rgb(39, 59, 129);
}

.card__name.cle {
	color: rgb(26, 46, 90);
}

.card__name.det {
	color: rgb(24, 45, 85);
}

.card__name.hou {
	color: rgb(30, 49, 96);
}

.card__name.kc {
	color: rgb(23, 72, 133);
}

.card__name.laa {
	color: rgb(0, 50, 99);
}

.card__name.lad {
	color: rgb(0, 90, 156);
}

.card__name.mil {
	color: rgb(26, 37, 80);
}

.card__name.min {
	color: rgb(26, 46, 90);
}

.card__name.nym {
	color: rgb(0, 45, 114);
}

.card__name.nyy {
	color: rgb(18, 36, 72);
}

.card__name.oak {
	color: rgb(1, 56, 49);
}

.card__name.phi {
	color: rgb(40, 73, 153);
}

.card__name.sd {
	color: rgb(30, 49, 96);
}

.card__name.sea {
	color: rgb(24, 45, 85);
}

.card__name.stl {
	color: rgb(34, 32, 95);
}

.card__name.tb {
	color: rgb(27, 47, 91);
}

.card__name.tex {
	color: rgb(35, 57, 116);
}

.card__name.tor {
	color: rgb(30, 46, 92);
}

.card__name.wsh {
	color: rgb(33, 39, 89);
}
</style>
