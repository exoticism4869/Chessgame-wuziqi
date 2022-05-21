import http from 'http'
import fs from 'node:fs/promises'
import { ip } from './getIP.js'

const PORT = 8000

const server = http.createServer(async (req, res) => {
	const reqUrl = new URL(req.url, `http://${req.headers.host}`)
	const reqPath = reqUrl.pathname
	switch (reqPath) {
		case '/': {
			const content = await fs.readFile('./dist/index.html')
			res.setHeader('content-type', 'text/html')
			res.writeHead(200)
			res.end(content)
			break
		}
		case '/app.js': {
			const content = await fs.readFile('./dist/app.js')
			res.setHeader('content-type', 'text/javascript')
			res.writeHead(200)
			res.end(content)
			break
		}
		default: {
			const content = await fs.readFile('./dist/index.html')
			res.setHeader('content-type', 'text/html')
			res.writeHead(200)
			res.end(content)
			break
		}
	}
})

// try to use original websocket, but failed
// 监听upgrade事件，协议升级
// server.on('upgrade', (req, socket) => {
// 	if (req.headers['upgrade'] !== 'websocket') {
// 		socket.end('HTTP/1.1 400 Bad Request')
// 		return
// 	}
// 	console.log('connect to one user...')
// 	// Read the websocket key provided by the client:
// 	const acceptKey = req.headers['sec-websocket-key']
// 	// Generate the response value to use in the response:
// 	const hash = generateAcceptValue(acceptKey)
// 	// Write the HTTP response into an array of response lines:
// 	const responseHeaders = [
// 		'HTTP/1.1 101 Web Socket Protocol Handshake',
// 		'Upgrade: WebSocket',
// 		'Connection: Upgrade',
// 		`Sec-WebSocket-Accept: ${hash}`
// 	]
// 	// Write the response back to the client socket, being sure to append two
// 	// additional newlines so that the browser recognises the end of the response
// 	// header and doesn't continue to wait for more header data:
// 	socket.write(responseHeaders.join('\r\n') + '\r\n\r\n')

// 	socket.on('end', () => {
// 		let data
// 		while ((data = socket.read())) {
// 			console.log('data:', data)
// 			data = JSON.parse(data)
// 			if (data.type === 0) {
// 				addPlayer(socket, data.name)
// 				sockets.push(socket)
// 			} else if (data.type === 1) {
// 				const playerToInvite = data.id
// 				const socketTo = sockets.find((so) => so.id === playerToInvite)
// 				const msg = {
// 					type: 1,
// 					from: socket.name
// 				}
// 				socketTo.write(JSON.stringify(msg))
// 			}
// 		}
// 	})

// 	socket.on('close', () => {
// 		deletePlayer(socket.id)
// 		console.log('disconnect one user.')
// 	})
// })

server.listen(PORT, () => {
	console.log('httpServer running at http://' + ip + ':8000/')
})
