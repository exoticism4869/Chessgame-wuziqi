<template>
	<div class="player">
		<div
			class="chess-turn"
			:class="{
				white: chessColor === 1,
				black: chessColor === 2,
				'jump-white': chessColor === 1 && turn,
				'jump-black': chessColor === 2 && turn
			}"
		></div>
		<span>{{ name }}</span>
	</div>
</template>

<script>
export default {
	name: 'Player',
	props: {
		name: String,
		turn: Boolean
	},
	data() {
		return {
			chessColor: undefined
		}
	},
	created() {
		console.log(this.turn)
		if (this.turn) {
			this.chessColor = 1
		} else {
			this.chessColor = 2
		}
	}
}
</script>

<style lang="scss" scoped>
.player {
	text-align: center;
	font-size: 20px;
	color: peru;
}
.chess-turn {
	width: 80px;
	height: 80px;
	border-radius: 40px;
}
.white {
	background-color: rgb(231, 225, 225);
}
.black {
	background-color: black;
}
.jump-white {
	animation: 2s ease-in infinite both colorChangeWhite;
}
.jump-black {
	animation: 2s ease-in infinite both colorChangeBlack;
}

@keyframes colorChangeWhite {
	from {
		background-color: rgb(231, 225, 225);
	}
	50% {
		background-color: rgb(214, 197, 184);
	}
	to {
		background-color: rgb(231, 225, 225);
	}
}
@keyframes colorChangeBlack {
	from {
		background-color: black;
	}
	50% {
		background-color: rgb(214, 197, 184);
	}
	to {
		background-color: black;
	}
}
</style>
