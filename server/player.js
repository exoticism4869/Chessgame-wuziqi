import { SERVER_OPS } from '../static/constants.js'
export const players = []

// 发送玩家改变后的players, except id's ws
function informPlayerChangeExceptWithID(wss, id) {
	for (let client of wss.clients) {
		if (client.id === id) {
			continue
		}
		const data = {
			type: SERVER_OPS.PUSH_PLAYERS,
			self: client.id,
			players
		}
		client.send(JSON.stringify(data))
	}
}

export function addPlayer(wss, id, name) {
	players.push({
		id,
		name,
		state: 0
	})
	informPlayerChangeExceptWithID(wss)
}

export function deletePlayer(wss, id) {
	players.splice(
		players.findIndex((player) => player.id === id),
		1
	)
	informPlayerChangeExceptWithID(wss, id)
}
