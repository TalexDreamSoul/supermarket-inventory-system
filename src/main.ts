import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

import './styles/main.css'
import 'uno.css'

const app = createApp(App)
const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})

const publicPaths = new Set(['/auth/login', '/auth/register'])

router.beforeEach((to) => {
  const rawToken = localStorage.getItem('sis.access_token')
  const hasToken = Boolean(rawToken && rawToken !== 'null' && rawToken !== 'undefined')

  if (!hasToken && !publicPaths.has(to.path))
    return { path: '/auth/login', query: { redirect: to.fullPath } }

  if (hasToken && to.path === '/auth/login')
    return { path: '/' }
})

app.use(router)
app.mount('#app')
