import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Calculator from '@/views/Calculator.vue'
import EnglishTraining from '@/views/EnglishTraining.vue'
import FocusTraining from '@/views/FocusTraining.vue'
import StroopTestPage from '@/views/StroopTestPage.vue'
import MemoryCardsPage from '@/views/MemoryCardsPage.vue'
import TimerDebugPage from '@/views/TimerDebugPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/calculator',
      name: 'calculator',
      component: Calculator
    },
    {
      path: '/focus-training',
      name: 'focus-training',
      component: FocusTraining
    },
    {
      path: '/focus-training/stroop-test',
      name: 'stroop-test',
      component: StroopTestPage
    },
    {
      path: '/focus-training/memory-cards',
      name: 'memory-cards',
      component: MemoryCardsPage
    },
    {
      path: '/focus-training/timer-debug',
      name: 'timer-debug',
      component: TimerDebugPage
    },
    {
      path: '/english-training',
      name: 'english-training',
      component: EnglishTraining,
      children: [
        {
          path: 'practice/:level',
          name: 'english-practice',
          component: () => import('@/components/EnglishPractice.vue')
        },
        {
          path: 'history',
          name: 'english-history',
          component: () => import('@/views/EnglishTraining.vue') // 重用入口頁面顯示歷史
        }
      ]
    }
  ]
})

export default router
