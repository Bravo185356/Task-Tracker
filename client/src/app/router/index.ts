import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/teams',
      component: () => import('@/views/TeamsList.vue')
    },
    {
      path: '/teams/:teamId',
      component: () => import('@/views/TeamRoot.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/TeamDetails.vue')
        },
        {
          path: 'manage',
          component: () => import('@/views/TeamManage.vue')
        },
        {
          path: 'boards/:boardId',
          component: () => import('@/views/Board.vue')
        },
        {
          path: 'tasks/:taskId',
          component: () => import('@/views/TaskPage.vue')
        },
        {
          path: 'tasks',
          component: () => import('@/views/TasksList.vue')
        },
        {
          path: 'chats/:chatId',
          component: () => import('@/views/ChatPage.vue')
        },
        {
          path: 'chats/new/:userId',
          component: () => import('@/views/ChatPage.vue')
        }
      ]
    }
  ]
})

export default router