import App from './App.vue'
import { createApp } from 'vue'
import { router } from '../Router/router.js'

const app = createApp(App)
app.use(router)
app.mount('#app')
