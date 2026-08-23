import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/drivers',
      name: 'drivers',
      component: () => import('@/views/DriverStandingsView.vue'),
    },
    {
      path: '/drivers/:number',
      name: 'driver-profile',
      component: () => import('@/views/DriverProfileView.vue'),
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('@/views/ConstructorStandingsView.vue'),
    },
    {
      path: '/teams/:name',
      name: 'team-profile',
      component: () => import('@/views/TeamProfileView.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/RaceCalendarView.vue'),
    },
    {
      path: '/race/:sessionKey',
      name: 'race-detail',
      component: () => import('@/views/RaceDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
