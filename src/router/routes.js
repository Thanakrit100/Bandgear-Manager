const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/equipments' },
      {
        path: 'equipments',
        name: 'equipments',
        component: () => import('@/pages/EquipmentPage.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'member'] }
      },
      {
        path: 'summary',
        name: 'summary',
        component: () => import('@/pages/SummaryPage.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'member'] }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/pages/UsersPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'member'] }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes