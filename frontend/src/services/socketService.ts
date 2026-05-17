import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

export interface RealTimeMessage {
  event: string;
  payload: any;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket || this.isConnected) {
      return;
    }

    const token = authService.getToken();
    if (!token) {
      console.warn('SocketService: No token available for connection.');
      return;
    }

    this.socket = io(API_BASE_URL.replace(/\/api$/, ''), {
      path: '/socket.io',
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.warn('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('user:status', (data) => {
      console.log('Realtime user status:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event: string, payload: any) {
    if (!this.socket) {
      console.warn('SocketService: Socket not initialized.');
      return;
    }
    this.socket.emit(event, payload);
  }

  on(event: string, callback: (payload: any) => void) {
    if (!this.socket) {
      console.warn('SocketService: Socket not initialized.');
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (payload: any) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }

  get connected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
