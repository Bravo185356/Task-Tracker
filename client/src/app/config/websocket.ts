import { io, Socket } from 'socket.io-client';
import { WS_URL } from './api';

class WebSocketService {
  private socket: Socket | null = null;
  private connected = false;

  connect() {
    this.socket = io(`${WS_URL}/kanban`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket error:', error.message);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: unknown) {
    this.socket?.emit(event, data);
  }

  on<T = unknown>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback as (...args: unknown[]) => void);
  }

  off<T = unknown>(event: string, callback?: (data: T) => void) {
    if (callback) {
      this.socket?.off(event, callback as (...args: unknown[]) => void);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  getSocket() {
    return this.socket;
  }
}

export const ws = new WebSocketService();
ws.connect();