import { createRouter, createWebHistory } from 'vue-router'
import FuelDashboard from '../FuelDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: FuelDashboard
    }
  ],
})

export default router
