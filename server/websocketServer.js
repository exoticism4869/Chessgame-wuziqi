import { WebSocketServer } from 'ws'
import { ip } from './getIP.js'
import { addPlayer, deletePlayer } from './player.js'
import { USER_OPS, SERVER_OPS } from '../static/constants.js'

const wss = new WebSocketServer({ port: 8001, clientTracking: true })
console.log('websocket server running ...')

wss.getUniqueID = function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1)
	}
	return s4() + s4() + '-' + s4()
}

wss.on('connection', (ws) => {
	ws.id = wss.getUniqueID()
	console.log('一个新的连接：' + ws.id + '\n')
	ws.on('message', (msg) => {
		msg = JSON.parse(msg)
		switch (msg.type) {
			case USER_OPS.INIT_GAMENAME: {
				// 接收来自客户端上传的游戏名
				ws.name = msg.name
				console.log('来自' + ws.id + '上传的游戏名', msg.name, '\n')
				addPlayer(wss, ws.id, msg.name)
				// 将玩家name和id返回
				const data = {
					type: SERVER_OPS.REPLY_INIT,
					name: ws.name,
					id: ws.id
				}
				ws.send(JSON.stringify(data))
				break
			}
			case USER_OPS.SEND_INVITE_TO_SERVER: {
				// 接收客户端发起的邀请请求
				console.log(ws.name, '邀请', msg.to.name, '进行游戏', '\n')
				const data = {
					type: SERVER_OPS.SEND_INVITE_TO_RECEIVER,
					from: {
						name: ws.name,
						id: ws.id
					}
				}
				const receiver = findWSByID(wss, msg.to.id)
				receiver.send(JSON.stringify(data))
				break
			}
			case USER_OPS.ANSWER_INVITE_TO_SERVER: {
				// 接收客户端对于别人邀请的回复
				const another = findWSByID(wss, msg.from.id)
				console.log(msg)
				if (msg.answer) {
					// 将ws与msg.from配对进入游戏
					console.log(ws.name, '与', msg.from.name, '进入游戏')
					const data1 = {
						type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
						game: true,
						opposite: {
							name: another.name,
							id: another.id
						},
						// first为true代表此人先下棋
						first: true
					}
					const data2 = {
						type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
						game: true,
						opposite: {
							name: ws.name,
							id: ws.id
						},
						first: false
					}
					ws.send(JSON.stringify(data1))
					another.send(JSON.stringify(data2))
				} else {
					// 拒绝掉msg.from的邀请
					console.log(ws.name, '拒绝掉了', msg.from.name, '的邀请', '\n')
					const data = {
						type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
						game: false,
						from: {
							name: ws.name,
							id: ws.id
						}
					}
					another.send(JSON.stringify(data))
				}
				break
			}
			case USER_OPS.SEND_STEP_TO_SERVER: {
				// 转发玩家发来的step
				const receiver = findWSByID(wss, msg.opposite.id)
				const data = {
					type: SERVER_OPS.TRANSFER_STEP_TO_PLAYER,
					step: {
						x: msg.step.x,
						y: msg.step.y
					}
				}
				receiver.send(JSON.stringify(data))
				break
			}
			case USER_OPS.SEND_REGRET_REQUEST_TO_SERVER: {
				// 转发玩家悔棋请求
				const data = {
					type: SERVER_OPS.SEND_REGRET_REQUEST_TO_PLAYER
				}
				const to = findWSByID(wss, msg.to.id)
				to.send(JSON.stringify(data))
				break
			}
			case USER_OPS.ANSWER_REGRET_TO_SERVER: {
				// 回复玩家的悔棋请求
				const data = {
					type: SERVER_OPS.ANSWER_REGRET_TO_SENDER,
					answer: msg.answer
				}
				const to = findWSByID(wss, msg.to.id)
				to.send(JSON.stringify(data))
				break
			}
			case USER_OPS.SEND_REPLAY_REQUEST_TO_SERVER: {
				// 转发玩家的重开请求
				const data = {
					type: SERVER_OPS.SEND_REPLAY_REQUEST_TO_PLAYER
				}
				const to = findWSByID(wss, msg.to.id)
				to.send(JSON.stringify(data))
				break
			}
			case USER_OPS.ANSWER_REPLAY_TO_SERVER: {
				// 回复玩家的重开请求
				const data = {
					type: SERVER_OPS.ANSWER_REPLAY_TO_SENDER,
					answer: msg.answer
				}
				const to = findWSByID(wss, msg.to.id)
				to.send(JSON.stringify(data))
				break
			}
		}
		// if (msg.type === USER_OPS.INIT_GAMENAME) {
		// 	// 接收来自客户端上传的游戏名
		// 	ws.name = msg.name
		// 	console.log('来自' + ws.id + '上传的游戏名', msg.name, '\n')
		// 	addPlayer(wss, ws.id, msg.name)
		// 	// 将玩家name和id返回
		// 	const data = {
		// 		type: SERVER_OPS.REPLY_INIT,
		// 		name: ws.name,
		// 		id: ws.id
		// 	}
		// 	ws.send(JSON.stringify(data))
		// } else if (msg.type === USER_OPS.SEND_INVITE_TO_SERVER) {
		// 	// 接收客户端发起的邀请请求
		// 	console.log(ws.name, '邀请', msg.to.name, '进行游戏', '\n')
		// 	const data = {
		// 		type: SERVER_OPS.SEND_INVITE_TO_RECEIVER,
		// 		from: {
		// 			name: ws.name,
		// 			id: ws.id
		// 		}
		// 	}
		// 	const receiver = findWSByID(wss, msg.to.id)
		// 	receiver.send(JSON.stringify(data))
		// } else if (msg.type === USER_OPS.ANSWER_INVITE_TO_SERVER) {
		// 	// 接收客户端对于别人邀请的回复
		// 	const another = findWSByID(wss, msg.from.id)
		// 	console.log(msg)
		// 	if (msg.answer) {
		// 		// 将ws与msg.from配对进入游戏
		// 		console.log(ws.name, '与', msg.from.name, '进入游戏')
		// 		const data1 = {
		// 			type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
		// 			game: true,
		// 			opposite: {
		// 				name: another.name,
		// 				id: another.id
		// 			},
		// 			// first为true代表此人先下棋
		// 			first: true
		// 		}
		// 		const data2 = {
		// 			type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
		// 			game: true,
		// 			opposite: {
		// 				name: ws.name,
		// 				id: ws.id
		// 			},
		// 			first: false
		// 		}
		// 		ws.send(JSON.stringify(data1))
		// 		another.send(JSON.stringify(data2))
		// 	} else {
		// 		// 拒绝掉msg.from的邀请
		// 		console.log(ws.name, '拒绝掉了', msg.from.name, '的邀请', '\n')
		// 		const data = {
		// 			type: SERVER_OPS.ANSWER_INVITE_TO_SENDER,
		// 			game: false,
		// 			from: {
		// 				name: ws.name,
		// 				id: ws.id
		// 			}
		// 		}
		// 		another.send(JSON.stringify(data))
		// 	}
		// } else if (msg.type === USER_OPS.SEND_STEP_TO_SERVER) {
		// 	// 转发玩家发来的step
		// 	const receiver = findWSByID(wss, msg.opposite.id)
		// 	const data = {
		// 		type: SERVER_OPS.TRANSFER_STEP_TO_PLAYER,
		// 		step: {
		// 			x: msg.step.x,
		// 			y: msg.step.y
		// 		}
		// 	}
		// 	receiver.send(JSON.stringify(data))
		// }
	})

	ws.on('close', () => {
		console.log(ws.name, 'quit the game', '\n')
		deletePlayer(wss, ws.id)
	})
})

function findWSByID(wss, id) {
	const clients = wss.clients.values()
	for (let client of clients) {
		if (client.id === id) {
			return client
		}
	}
}
