<template>
	<div class="container">
		<h1>
			<div class="wu">五</div>
			<div class="zi">子</div>
			<div class="qi">棋</div>
		</h1>
		<div class="mode">
			<router-link
				v-show="!onlinePlayMenu"
				class="mode-button"
				to="/offline-chess"
				>单机模式</router-link
			>
			<button
				:class="{
					'mode-button': !onlinePlayMenu,
					'online-mode': onlinePlayMenu
				}"
				@click="onlinePlayClick"
			>
				在线模式
			</button>
			<div class="player-info" v-show="onlinePlayMenu">
				<div class="game-name" v-if="showNameInput">
					<p>请输入游戏名</p>
					<input type="text" v-model="gameName" />
					<button @click="uploadGameName">确定</button>
				</div>
				<div class="online-player" v-show="!showNameInput">
					<ul>
						<li v-for="player in players" :key="player.id">
							<span>{{ player.name }}</span>
							<button @click="invite($event)" v-bind="player">邀请</button>
						</li>
					</ul>
				</div>
			</div>
			<div class="display-invites">
				<ul>
					<li v-for="invite in receivedInvites">
						<span>{{ invite.name }}请求与您对战</span>
						<button @click="acceptChallenge($event)" v-bind="invite">
							接受
						</button>
						<button @click="refuseChallenge($event)" v-bind="invite">
							拒绝
						</button>
						<span class="time">{{ invite.maxAge }}s</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
import { USER_OPS, SERVER_OPS } from 'static/constants.js'
import { throttle } from 'static/utils.js'
export default {
	name: 'ModeChoose',
	data() {
		return {
			// player: {id, name, state: (free | pending | playing | refused)}
			players: [],
			receivedInvites: [],
			gameName: '',
			showNameInput: true,
			onlinePlayMenu: false
		}
	},
	created() {
		this.gameName = sessionStorage.getItem('gameName')
	},
	methods: {
		uploadGameName() {
			if (!this.gameName) {
				alert('游戏名为空！')
				return
			}
			sessionStorage.setItem('gameName', this.gameName)
			this.onlinePlayClick()
		},
		onlinePlayClick() {
			this.onlinePlayMenu = true
			if (window.ws) {
				this.showNameInput = false
				return
			}
			// 连接websocket服务器
			if (!sessionStorage.getItem('gameName')) {
				this.showNameInput = true
				return
			}
			this.showNameInput = false

			// 先暂且把ws挂载在window全局变量上
			const hostname = window.location.hostname
			window.ws = new WebSocket('ws://' + hostname + ':8001')
			ws.addEventListener('open', () => {
				console.log('websocket connected!')
				// 提交游戏名
				const data = {
					type: USER_OPS.INIT_GAMENAME,
					name: this.gameName
				}
				ws.send(JSON.stringify(data))
			})
			ws.addEventListener('message', (msg) => {
				msg = JSON.parse(msg.data)
				switch (msg.type) {
					case SERVER_OPS.REPLY_INIT: {
						// 服务器返回该websocket的name和id
						ws.name = msg.name
						ws.id = msg.id
						break
					}
					case SERVER_OPS.SEND_INVITE_TO_RECEIVER: {
						// 服务器转发来自别人的邀请
						const from = msg.from
						from.maxAge = 10
						this.receivedInvites.push(from)
						const link = this.receivedInvites[this.receivedInvites.length - 1]
						let interval = setInterval(() => {
							link.maxAge--
							if (link.maxAge === 0) {
								this.refuseChallenge({ id: from.id, name: from.name })
								clearInterval(interval)
							}
						}, 1000)
						link.timer = interval
						break
					}
					case SERVER_OPS.ANSWER_INVITE_TO_SENDER: {
						// 服务器返回的邀请结果
						if (msg.game) {
							// 进入游戏
							this.$router.push({
								name: 'online-chess',
								query: {
									oppositeName: msg.opposite.name,
									oppositeID: msg.opposite.id,
									first: msg.first
								}
							})
							// 拒绝掉其他邀请
							this.refuseAllChallenge()
						}
						break
					}
					case SERVER_OPS.PUSH_PLAYERS: {
						// 服务器推送当前在线人数,但需要除去自己
						const players = msg.players
						const self = players.findIndex((player) => {
							return player.id === msg.self
						})
						if (self !== -1) {
							players.splice(self, 1)
						}
						this.players = players
						console.log(players)
						break
					}
				}
				// if (msg.type === SERVER_OPS.REPLY_INIT) {
				// 	// 服务器返回该websocket的name和id
				// 	ws.name = msg.name
				// 	ws.id = msg.id
				// } else if (msg.type === SERVER_OPS.SEND_INVITE_TO_RECEIVER) {
				// 	// 服务器转发来自别人的邀请
				// 	const from = msg.from
				// 	from.timer = 10
				// 	this.receivedInvites.push(from)
				// 	const link = this.receivedInvites[this.receivedInvites.length - 1]
				// 	let interval = setInterval(() => {
				// 		link.timer--
				// 		if (link.timer === 0) {
				// 			this.refuseChallenge({ id: from.id, name: from.name })
				// 			clearInterval(interval)
				// 		}
				// 	}, 1000)
				// } else if (msg.type === SERVER_OPS.ANSWER_INVITE_TO_SENDER) {
				// 	// 服务器返回的邀请结果
				// 	if (msg.game) {
				// 		// 进入游戏
				// 		this.$router.push({
				// 			name: 'online-chess',
				// 			query: {
				// 				oppositeName: msg.opposite.name,
				// 				oppositeID: msg.opposite.id,
				// 				first: msg.first
				// 			}
				// 		})
				// 		// 拒绝掉其他邀请
				// 		this.refuseAllChallenge()
				// 	} else {
				// 		// 发出的邀请被拒绝
				// 		const from = msg.from
				// 		const player = this.players.find((p) => p.id === from.id)
				// 		// player.state = 3
				// 	}
				// } else if (msg.type === SERVER_OPS.PUSH_PLAYERS) {
				// 	// 服务器推送当前在线人数,但需要除去自己
				// 	const players = msg.players
				// 	const self = players.findIndex((player) => {
				// 		return player.id === msg.self
				// 	})
				// 	if (self !== -1) {
				// 		players.splice(self, 1)
				// 	}
				// 	this.players = players
				// 	console.log(players)
				// }
			})
		},
		invite: throttle(function (e) {
			const id = e.target.getAttributeNode('id').value
			const name = e.target.getAttributeNode('name').value
			const data = {
				type: USER_OPS.SEND_INVITE_TO_SERVER,
				to: {
					id,
					name
				}
			}
			ws.send(JSON.stringify(data))
		}, 10000),
		acceptChallenge(e) {
			const id = e.target.getAttributeNode('id').value
			const name = e.target.getAttributeNode('name').value
			const data = {
				type: USER_OPS.ANSWER_INVITE_TO_SERVER,
				from: {
					id,
					name
				},
				answer: true
			}
			ws.send(JSON.stringify(data))
			const index = this.receivedInvites.findIndex((invite) => invite.id === id)
			clearInterval(this.receivedInvites[index].timer)
			this.receivedInvites.splice(index, 1)
		},
		refuseChallenge(e) {
			// 删除receivedInvites里对应的邀请
			let id, name
			if (e.target) {
				id = e.target.getAttributeNode('id').value
				name = e.target.getAttributeNode('name').value
			} else {
				id = e.id
				name = e.name
			}
			const index = this.receivedInvites.findIndex((invite) => invite.id === id)
			clearInterval(this.receivedInvites[index].timer)
			this.receivedInvites.splice(index, 1)
			const data = {
				type: USER_OPS.ANSWER_INVITE_TO_SERVER,
				from: {
					id,
					name
				},
				answer: false
			}
			ws.send(JSON.stringify(data))
		},
		refuseAllChallenge() {
			let invites = this.receivedInvites
			invites.forEach((invite) => {
				const data = {
					type: USER_OPS.ANSWER_INVITE_TO_SERVER,
					from: {
						name: invite.name,
						id: invite.id
					},
					answer: false
				}
				ws.send(JSON.stringify(data))
			})
			invites = []
		}
	}
}
</script>

<style lang="scss" scoped>
h1 {
	position: relative;
	// width: 1200px;
	height: 300px;
	font-family: 'Cool-Regular', sans-serif;
	font-size: 100px;
	text-align: center;
	margin: auto;
	div {
		position: absolute;
		transition: all 0.3s ease-in-out;
	}
	.wu {
		left: calc(25% - 50px);
		top: 100px;
		color: white;
		background-color: black;
		transform: rotate(-45deg);
		&:hover {
			transform: rotate(0);
		}
	}

	.zi {
		left: calc(50% - 50px);
		top: 50px;
		border-radius: 25px;
		color: peru;
		transition: all 0.7s ease-in-out;
		&:hover {
			transform: rotate(360deg);
		}
	}

	.qi {
		left: calc(75% - 50px);
		top: 100px;
		color: black;
		background-color: white;
		transform: rotate(45deg);
		&:hover {
			transform: rotate(0);
		}
	}
}
.mode-button {
	display: block;
	width: 200px;
	height: 80px;
	font-size: 20px;
	text-align: center;
	line-height: 80px;
	color: peru;
	border: none;
	border-radius: 8px;
	margin: 80px auto;
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

.online-mode {
	margin: 0 auto;
	display: block;
	width: 200px;
	height: 80px;
	font-size: 20px;
	text-align: center;
	line-height: 80px;
	color: peru;
	border: none;
	border-radius: 8px;
	background-color: white;
	transition: all 0.5s ease-in-out;
}
.player-info {
	width: 50%;
	height: 300px;
	margin: auto;
}
.game-name {
	margin: 20px auto;
	text-align: center;
	p {
		font-size: 30px;
		margin-bottom: 20px;
	}
	input {
		width: 40%;
		height: 40px;
		border: none;
		outline: none;
		padding-left: 10px;
		border-radius: 6px;
		background-color: rgb(225, 124, 124);
		font-size: 16px;
		margin-right: 10px;
		transition: all 0.3s ease-in-out;
		&:hover {
			background-color: rgb(204, 74, 74);
		}
		&:focus {
			background-color: brown;
		}
	}
	button {
		width: 20%;
		height: 40px;
		font-size: 16px;
		border: none;
		border-radius: 6px;
		outline: none;
		transition: all 0.3s ease-in-out;
		&:hover {
			cursor: pointer;
			color: white;
			background-color: black;
		}
	}
}
.online-player {
	p {
		text-align: center;
		font-size: 20px;
	}
	ul {
		li {
			display: flex;
			position: relative;
			justify-content: center;
			align-items: center;
			height: 60px;
			margin: 20px;
			&::after {
				content: '';
				display: block;
				position: absolute;
				bottom: 0;
				width: 70%;
				height: 1px;
				background-color: black;
			}
			span {
				flex-basis: 50%;
				font-size: 20px;
			}
			button {
				flex-basis: 25%;
				height: 40px;
				font-size: 20px;
				border-radius: 10px;
				border: none;
				transition: all 0.3s ease-in-out;
				&:hover {
					cursor: pointer;
					color: white;
					background-color: black;
				}
			}
		}
	}
}

.display-invites {
	position: absolute;
	right: 0;
	top: 300px;
	width: 30%;
	height: 300px;
	ul {
		li {
			height: 80px;
			border-radius: 40px 0 0 40px;
			display: flex;
			justify-content: center;
			align-items: center;
			span:nth-of-type(1) {
				flex-basis: 50%;
				font-size: 20px;
				text-align: center;
			}
			button {
				flex: 20%;
				height: 40px;
				font-size: 20px;
				border-radius: 10px;
				border: none;
				color: peru;
				transition: all 0.3s ease-in-out;
				background-color: transparent;
				&:nth-of-type(1):hover {
					cursor: pointer;
					color: black;
					background-color: rgb(227, 220, 220);
				}
				&:nth-of-type(2):hover {
					cursor: pointer;
					color: white;
					background-color: black;
				}
			}
			span:nth-of-type(2) {
				flex-basis: 10%;
				font-size: 20px;
				text-align: center;
			}
		}
	}
}
</style>
