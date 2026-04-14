import { ws } from './websocket';

let activeUserId: string | null = null;

function emitJoin() {
  if (activeUserId) {
    ws.emit('user:join', { userId: activeUserId });
  }
}

let reconnectBound = false;
function ensureReconnectHandler() {
  if (reconnectBound) return;
  reconnectBound = true;
  ws.on('connect', () => {
    emitJoin();
  });
}

export const userChannelWs = {
  join(userId: string) {
    ensureReconnectHandler();
    activeUserId = userId;
    emitJoin();
  },

  leave(userId: string) {
    if (activeUserId === userId) {
      activeUserId = null;
    }
    ws.emit('user:leave', { userId });
  },
};
