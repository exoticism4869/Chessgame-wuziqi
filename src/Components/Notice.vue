<template>
	<div class="notice-container">
		<div class="notice">
			<span>{{ msg }}</span>
			<div class="buttons">
				<button v-if="acceptMsg" @click="accept">{{ acceptMsg }}</button>
				<button v-if="refuseMsg" @click="refuse">{{ refuseMsg }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'notice',
	props: {
		msg: String,
		acceptMsg: String,
		refuseMsg: String
	},
	emits: ['accept', 'refuse'],
	methods: {
		accept() {
			this.$emit('accept')
		},
		refuse() {
			this.$emit('refuse')
		}
	}
}
</script>

<style lang="scss" scoped>
.notice-container {
	width: 100vw;
	height: 100vh;
	position: absolute;
	left: 0;
	top: 0;
	z-index: 5;
	background-color: rgba(255, 255, 255, 0.3);
}
.notice {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	width: 300px;
	height: 200px;
	border-radius: 10px;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	backdrop-filter: blur(6px);
	background-color: rgba(255, 255, 255, 0.7);
	z-index: 5;
	align-items: center;
	font-size: 20px;
}

.buttons {
	button {
		width: 140px;
		height: 60px;
		font-size: 20px;
		text-align: center;
		line-height: 60px;
		color: peru;
		border: none;
		border-radius: 8px;
		transition: all 0.5s ease-in-out;
		background-color: white;
		&:hover:nth-child(1) {
			&:hover {
				cursor: pointer;
				color: white;
				background-color: black;
			}
		}
		&:hover:nth-child(2) {
			&:hover {
				cursor: pointer;
				color: black;
				background-color: rgb(223, 221, 221);
			}
		}
	}
}
</style>
