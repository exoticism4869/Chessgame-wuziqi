import ModeChoose from 'src/Views/ModeChoose.vue'
import OfflineChess from 'src/Views/OfflineChess.vue'
import OnlineChess from 'src/Views/OnlineChess.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		redirect: '/mode-choose'
	},
	{
		path: '/mode-choose',
		name: 'mode-choose',
		component: ModeChoose
	},
	{
		path: '/offline-chess',
		name: 'offline-chess',
		component: OfflineChess
	},
	{
		path: '/online-chess',
		name: 'online-chess',
		component: OnlineChess
	}
]

export const router = createRouter({
	history: createWebHashHistory(),
	routes
})
