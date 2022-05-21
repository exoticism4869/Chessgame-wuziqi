<template>
	<div class="container">
		<div class="side-bar">
			<div class="players">
				<Player :turn="!myTurn" :name="oppositeName" />
				<Player :turn="myTurn" :name="myName" />
			</div>
			<SideBar @toggleRegret="toggleRegret" @toggleReStart="toggleReStart" />
		</div>
		<Board
			ref="board"
			:boardSize="boardSize"
			:chessRadius="chessRadius"
			@changeSide="changeSide"
			:certainChess="certainChess"
			:myTurn="myTurn"
			:online="true"
			@getWinner="getWinner"
		/>
		<Notice
			v-if="showRegretRequest"
			:msg="oppositeName + '请求悔棋'"
			acceptMsg="接受"
			refuseMsg="拒绝"
			@accept="acceptRegret"
			@refuse="refuseRegret"
		/>
		<Notice
			v-if="showWinner"
			:msg="winnerMsg"
			acceptMsg="再来一局"
			@accept="AnotherGameRequest"
		/>
		<Notice
			v-if="showAnotherGameRequest"
			:msg="oppositeName + '请求再来一局'"
			acceptMsg="接受"
			refuseMsg="拒绝"
			@accept="acceptAnotherGame"
			@refuse="refuseAnotherGame"
		/>
	</div>
</template>

<script>
import { USER_OPS, SERVER_OPS } from 'static/constants'
import Board from 'src/Components/Board.vue'
import Player from 'src/Components/Player.vue'
import SideBar from 'src/Components/SideBar.vue'
import Notice from 'src/Components/Notice.vue'

export default {
	name: 'OnlineChess',
	components: { Board, Player, SideBar, Notice },
	data() {
		return {
			boardSize: 18,
			chessRadius: 20,
			myTurn: undefined,
			myName: undefined,
			myID: undefined,
			oppositeName: undefined,
			oppositeID: undefined,
			certainChess: {
				x: undefined,
				y: undefined
			},
			showRegretRequest: false,
			showWinner: false,
			winnerMsg: undefined,
			showAnotherGameRequest: false
		}
	},
	created() {
		const search = new URLSearchParams(window.location.search)

		this.myTurn = search.get('first') === 'true' ? true : false
		this.oppositeName = search.get('oppositeName')
		this.oppositeID = search.get('oppositeID')
		this.myName = ws.name
		this.myID = ws.id

		ws.addEventListener('message', (msg) => {
			msg = JSON.parse(msg.data)
			switch (msg.type) {
				case SERVER_OPS.TRANSFER_STEP_TO_PLAYER: {
					this.certainChess = {
						x: msg.step.x,
						y: msg.step.y
					}
					this.myTurn = true
					break
				}
				case SERVER_OPS.SEND_REGRET_REQUEST_TO_PLAYER: {
					this.showRegretRequest = true
					break
				}
				case SERVER_OPS.ANSWER_REGRET_TO_SENDER: {
					if (msg.answer) {
						this.$refs.board.regretTwoSteps()
					}
					break
				}
				case SERVER_OPS.SEND_REPLAY_REQUEST_TO_PLAYER: {
					this.showAnotherGameRequest = true
				}
				case SERVER_OPS.ANSWER_REPLAY_TO_SENDER: {
					if (msg.answer) {
						this.$refs.board.reStart()
					}
				}
			}
			// if (msg.type === SERVER_OPS.TRANSFER_STEP_TO_PLAYER) {
			// 	this.certainChess = {
			// 		x: msg.step.x,
			// 		y: msg.step.y
			// 	}
			// 	this.myTurn = true
			// } else if (msg.type === SERVER_OPS.SEND_REGRET_REQUEST_TO_PLAYER) {
			// 	this.showRegretRequest = true
			// } else if (msg.type === SERVER_OPS.ANSWER_REGRET_TO_SENDER) {
			// 	if (msg.answer) {
			// 		this.$refs.board.regretTwoSteps()
			// 	}
			// } else if (msg.type === SERVER_OPS.SEND_REPLAY_REQUEST_TO_PLAYER) {
			// }
		})
	},
	methods: {
		toggleRegret() {
			// 向对方发送悔棋请求
			const data = {
				type: USER_OPS.SEND_REGRET_REQUEST_TO_SERVER,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
		},
		toggleReStart() {
			// 向对方发送重开请求
			const data = {
				type: USER_OPS.SEND_REPLAY_REQUEST_TO_SERVER,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
		},
		changeSide(chessX, chessY) {
			const data = {
				type: USER_OPS.SEND_STEP_TO_SERVER,
				step: {
					x: chessX,
					y: chessY
				},
				opposite: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
			this.myTurn = false
		},
		acceptRegret() {
			const data = {
				type: USER_OPS.ANSWER_REGRET_TO_SERVER,
				answer: true,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
			this.showRegretRequest = false
			this.$refs.board.regretTwoSteps()
		},
		refuseRegret() {
			const data = {
				type: USER_OPS.ANSWER_REGRET_TO_SERVER,
				answer: false,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
			this.showRegretRequest = false
		},
		getWinner(msg) {
			this.showWinner = true
			this.winnerMsg = msg
		},
		AnotherGameRequest() {
			const data = {
				type: USER_OPS.SEND_REPLAY_REQUEST_TO_SERVER,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
		},
		acceptAnotherGame() {
			const data = {
				type: USER_OPS.ANSWER_REPLAY_TO_SERVER,
				answer: true,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
			this.showAnotherGameRequest = false
			this.$refs.board.reStart()
		},
		refuseAnotherGame() {
			const data = {
				type: USER_OPS.ANSWER_REPLAY_TO_SERVER,
				answer: false,
				to: {
					name: this.oppositeName,
					id: this.oppositeID
				}
			}
			ws.send(JSON.stringify(data))
			this.showAnotherGameRequest = false
		}
	}
}
</script>

<style lang="scss" scoped>
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
