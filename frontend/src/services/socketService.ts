import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    if (socket?.connected) {
      return socket;
    }

    const token = authService.getToken();
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connect error:', error);
    });

    return socket;
  },

  getSocket(): Socket | null {
    if (!socket) {
      try {
        return this.connect();
      } catch (error) {
        console.warn('Socket connection failed:', error);
        return null;
      }
    }
    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },
};
