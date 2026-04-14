# Task Tracker

Fullstack приложение для управления проектами с поддержкой командной работы в реальном времени. **Это не конечная версия проекта, всё ещё в разработке**

## Функционал

- **Авторизация** — регистрация и вход по JWT токенам
- **Команды** — создание команд и управление участниками
- **Задачи** — создание задач с приоритетами, статусами и исполнителями
- **Kanban-доски** — drag-and-drop управление задачами с real-time обновлениями
- **Чаты** — личные сообщения между участниками команды с поддержкой файлов

## Стек

**Фронтенд:** 
- Vue.js 3
- TypeScript
- Vue Router 
- Pinia
- Vite
- TanStack Query
- TailwindCSS
- PrimeVue
- Socket.io-client

**Бэкенд:**
- NestJS
- TypeScript
- PostgreSQL 
- Prisma
- JWT
- Socket.io

**База данных** - PostgreSQL

## Запуск

```bash
cd client
npm install
npm run dev
```
