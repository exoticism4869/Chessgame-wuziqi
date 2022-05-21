<template>
	<div class="container">
		<div class="side-bar">
			<div class="players">
				<Player name="White" :turn="turn === 1" />
				<Player name="Black" :turn="turn === 2" />
			</div>
			<SideBar @toggleRegret="toggleRegret" @toggleReStart="toggleReStart" />
		</div>
		<Board
			ref="board"
			:boardSize="boardSize"
			:chessRadius="chessRadius"
			@changeSide="changeSide"
			:myTurn="true"
			:online="false"
			@getWinner="getWinner"
		></Board>
		<Notice
			v-if="showWinner"
			:msg="winnerMsg"
			acceptMsg="再来一局"
			@accept="toggleReStart"
		/>
	</div>
</template>

<script>
import SideBar from 'src/Components/SideBar.vue'
import Board from 'src/Components/Board.vue'
import Player from 'src/Components/Player.vue'
import Notice from 'src/Components/Notice.vue'
export default {
	name: 'app',
	components: { SideBar, Board, Player, Notice },
	data() {
		return {
			boardSize: 18,
			chessRadius: 20,
			turn: 1,
			showWinner: false,
			winnerMsg: undefined
		}
	},
	methods: {
		toggleRegret() {
			this.$refs.board.regretOneStep()
			this.turn = this.turn === 1 ? 2 : 1
		},
		toggleReStart() {
			this.showWinner = false
			this.$refs.board.reStart()
			this.turn = 1
		},
		changeSide(x, y) {
			this.turn = this.turn === 1 ? 2 : 1
		},
		getWinner(msg) {
			this.showWinner = true
			this.winnerMsg = msg
		}
	}
}
</script>

<style scoped>
.container {
	display: flex;
	justify-content: space-around;
}

.side-bar {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.players {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	gap: 40px;
}
</style>
