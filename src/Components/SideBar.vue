<template>
	<div class="container">
		<button @click="regret">悔棋</button>
		<button @click="restart">重新开始</button>
	</div>
</template>

<script>
export default {
	name: 'sidebar',
	emits: ['toggleRegret', 'toggleReStart'],
	methods: {
		regret() {
			this.$emit('toggleRegret')
		},
		restart() {
			this.$emit('toggleReStart')
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	text-align: center;
}
h1 {
	text-align: center;
	margin-bottom: 6em;
}
button {
	color: peru;
	width: 6em;
	height: 3em;
	border: none;
	border-radius: 4px;
	font-size: 20px;
	margin: 2em;
	transition: all 0.3s ease-in-out;
	background-color: white;
	&:first-child:hover {
		cursor: pointer;
		color: white;
		background-color: black;
	}
	&:last-child:hover {
		cursor: pointer;
		color: black;
		background-color: rgb(237, 236, 236);
	}
}
</style>
