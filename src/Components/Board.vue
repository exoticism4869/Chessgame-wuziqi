<template>
	<div class="board-container">
		<canvas
			id="board-layer"
			ref="canvas1"
			:width="boardLayerLenth"
			:height="boardLayerLenth"
		></canvas>
		<canvas
			id="chess-layer"
			ref="canvas2"
			@click="dropChess"
			:width="boardLayerLenth"
			:height="boardLayerLenth"
		></canvas>
		<!-- <Notice v-show="winner" :msg="getNoticeMsg" /> -->
	</div>
</template>

<script>
import Notice from './Notice.vue'
export default {
	name: 'board',
	components: { Notice },
	props: {
		boardSize: Number,
		chessRadius: Number,
		certainChess: Object,
		myTurn: Boolean,
		online: Boolean
	},
	emits: ['changeSide', 'getWinner'],
	data() {
		return {
			// chessRadius: 20, // 棋子半径
			chess: Array(this.boardSize + 1)
				.fill()
				.map(() => {
					return Array(this.boardSize + 1).fill(0)
				}),
			currentPlayer: 1,
			winner: 0,
			history: [],
			shouldDrawCertainChess: false
		}
	},
	computed: {
		boardLayerLenth() {
			return (this.boardSize + 1) * this.chessRadius * 2
		},
		getNoticeMsg() {
			return this.winner === 1 ? '白棋获胜' : '黑棋获胜'
		}
	},
	watch: {
		chess: {
			handler(val) {
				this.drawChessLayer(val)
				if (this.history.length > 0) {
					this.checkWinner(val, this.history[this.history.length - 1])
				}
			},
			deep: true
		},
		certainChess(val) {
			if (!val.x) {
				return
			}
			this.drawCertainChess(val.x, val.y)
		}
	},
	mounted() {
		this.drawBoardLayer(this.boardLayerLenth)
	},
	methods: {
		getCurrentPlayer() {
			const player = this.currentPlayer
			this.currentPlayer = player === 1 ? 2 : 1
			return player
		},
		drawBoardLayer(boardLayerLenth) {
			const canvas = this.$refs.canvas1
			const ctx = canvas.getContext('2d')
			const boardSize = this.boardSize
			const chessRadius = this.chessRadius

			ctx.beginPath()
			ctx.fillStyle = '#b28d5e'
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			ctx.beginPath()
			ctx.strokeStyle = '#000'

			// 绘制横线
			for (let i = 0; i <= boardSize; i++) {
				const y = i * chessRadius * 2 + chessRadius
				ctx.moveTo(chessRadius, y)
				ctx.lineTo(boardLayerLenth - chessRadius, y)
			}

			// 绘制竖线
			for (let i = 0; i <= boardSize; i++) {
				const x = i * chessRadius * 2 + chessRadius
				ctx.moveTo(x, chessRadius)
				ctx.lineTo(x, boardLayerLenth - chessRadius)
			}

			ctx.stroke()
		},
		drawChessLayer(chess) {
			const canvas = this.$refs.canvas2
			const ctx = canvas.getContext('2d')
			const chessSize = chess.length
			const chessRadius = this.chessRadius
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			// ctx.beginPath()
			// ctx.fillStyle = '#c1b082'
			// ctx.fillRect(0, 0, canvas.width, canvas.height)

			// 根据chess绘制棋子层
			for (let i = 0; i < chessSize; i++) {
				const x = chessRadius + i * chessRadius * 2
				for (let j = 0; j < chessSize; j++) {
					const player = chess[i][j]
					if (player === 0) {
						continue
					} else if (player === 1) {
						ctx.fillStyle = '#fff'
					} else {
						ctx.fillStyle = '#000'
					}
					ctx.beginPath()
					ctx.arc(
						x,
						chessRadius + j * chessRadius * 2,
						chessRadius,
						0,
						Math.PI * 2
					)
					ctx.fill()
				}
			}
		},
		dropChess(e) {
			if (!this.myTurn) {
				return
			}

			const chessRadius = this.chessRadius
			const canvas = this.$refs.canvas2
			const canvasRect = canvas.getBoundingClientRect()
			const x = e.clientX - canvasRect.left
			const y = e.clientY - canvasRect.top

			const Ix = Math.floor(x / chessRadius / 2)
			const Iy = Math.floor(y / chessRadius / 2)

			const Fx = x % chessRadius
			const Fy = y % chessRadius

			const targetX = Fx < chessRadius ? Ix : Ix + 1
			const targetY = Fy < chessRadius ? Iy : Iy + 1

			if (this.chess[targetX][targetY]) {
				return
			}
			this.chess[targetX][targetY] = this.getCurrentPlayer()

			this.history.push([targetX, targetY])
			// 发送给父组件
			this.$emit('changeSide', targetX, targetY)
		},
		drawCertainChess(x, y) {
			this.chess[x][y] = this.getCurrentPlayer()
			this.history.push([x, y])
		},
		checkBetween0And18(x) {
			if (x >= 0 && x <= 18) {
				return true
			} else {
				return false
			}
		},
		checkWinner(chess, point) {
			const target = chess[point[0]][point[1]]
			const operation = [
				[1, 0],
				[1, 1],
				[0, 1],
				[-1, 1]
			]
			for (let op of operation) {
				let x = point[0],
					y = point[1]
				let left = 0,
					right = 0
				while (
					this.checkBetween0And18(x + op[0]) &&
					this.checkBetween0And18(y + op[1]) &&
					chess[(x += op[0])][(y += op[1])] === target
				) {
					right++
				}
				x = point[0]
				y = point[1]
				while (
					this.checkBetween0And18(x - op[0]) &&
					this.checkBetween0And18(y - op[1]) &&
					chess[(x -= op[0])][(y -= op[1])] === target
				) {
					left--
				}
				if (right - left >= 4) {
					this.winner = target
					this.$emit('getWinner', this.getNoticeMsg)
					return
				}
			}
			this.winner = 0
		},
		regretOneStep() {
			let temp = this.history.pop()
			this.chess[temp[0]][temp[1]] = 0
			this.getCurrentPlayer()
		},
		regretTwoSteps() {
			let temp = this.history.pop()
			this.chess[temp[0]][temp[1]] = 0
			temp = this.history.pop()
			this.chess[temp[0]][temp[1]] = 0
		},
		reStart() {
			this.chess.forEach((row) => {
				row.fill(0)
			})
			this.history = []
			this.currentPlayer = 1
			this.winner = 0
		}
	}
}
</script>

<style scoped>
.board-container {
	min-width: 800px;
	height: 100vh;
	position: relative;
}

#board-layer {
	z-index: 1;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	margin: auto;
}

#chess-layer {
	z-index: 2;
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	margin: auto;
}
</style>
