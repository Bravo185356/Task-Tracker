import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      name: 'TeamsList',
      path: '/teams',
      component: () => import('@/views/TeamsList.vue')
    },
    {
      name: 'TeamRoot',
      path: '/teams/:teamId',
      component: () => import('@/views/TeamRoot.vue'),
      children: [
        {
          name: 'TeamDetails',
          path: '',
          component: () => import('@/views/TeamDetails.vue')
        },
        {
          name: 'TeamManage',
          path: 'manage',
          component: () => import('@/views/TeamManage.vue')
        },
        {
          name: 'BoardPage',
          path: 'boards/:boardId',
          component: () => import('@/views/Board.vue')
        },
        {
          path: 'tasks/:taskId',
          component: () => import('@/views/TaskPage.vue')
        },
        {
          name: 'TasksList',
          path: 'tasks',
          component: () => import('@/views/TasksList.vue')
        },
        {
          name: 'ChatPage',
          path: 'chats/:chatId',
          component: () => import('@/views/ChatPage.vue')
        },
        {
          name: 'NewChatPage',
          path: 'chats/new/:userId',
          component: () => import('@/views/ChatPage.vue')
        }
      ]
    }
  ]
})

export default router