import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from '@/stores/authStore'

export default function () {
  const isServer = typeof window === 'undefined'
  const routerMode = import.meta.env.VUE_ROUTER_MODE || 'hash'
  const routerBase = import.meta.env.VUE_ROUTER_BASE || '/'

  const createHistory = isServer
    ? createMemoryHistory
    : routerMode === 'history'
      ? createWebHistory
      : createWebHashHistory

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(routerBase)
  })

  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const currentRole = authStore.user?.role || authStore.role || 'guest'
    const isLoggedIn = Boolean(authStore.token && authStore.user)

    if (to.meta.requiresAuth && !isLoggedIn) {
      return to.name === 'login' ? true : { name: 'login', replace: true }
    }

    if (to.name === 'login' && isLoggedIn) {
      return { name: 'equipments', replace: true }
    }

    if (Array.isArray(to.meta.roles) && !to.meta.roles.includes(currentRole)) {
      if (to.name === 'equipments') {
        return { name: 'login', replace: true }
      }
      return { name: 'equipments', replace: true }
    }

    return true
  })

  return router
}