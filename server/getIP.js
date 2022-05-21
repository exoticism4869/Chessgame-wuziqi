import { networkInterfaces } from 'os'
import crypto from 'crypto'

const nets = networkInterfaces()
const results = Object.create(null) // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
	for (const net of nets[name]) {
		// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
		if (net.family === 'IPv4' && !net.internal) {
			if (!results[name]) {
				results[name] = []
			}
			results[name].push(net.address)
		}
	}
}

export function generateAcceptValue(acceptKey) {
	return crypto
		.createHash('sha1')
		.update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
		.digest('base64')
}

export const ip = results['WLAN'][0]
