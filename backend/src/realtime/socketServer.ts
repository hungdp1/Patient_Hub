import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import RealTimeServer from './RealTimeServer';

let io: Server | null = null;
let realtimeServer: RealTimeServer | null = null;

export function initializeRealTimeServer(httpServer: HTTPServer): void {
  realtimeServer = new RealTimeServer(httpServer);
  io = realtimeServer.getIO();
}

export function getRealTimeIO(): Server {
  if (!io) {
    throw new Error('Real-time server has not been initialized yet.');
  }
  return io;
}

export function notifyUser(userId: string, event: string, data: any): void {
  getRealTimeIO().to(`user:${userId}`).emit(event, data);
}

export function notifyRole(role: string, event: string, data: any): void {
  getRealTimeIO().to(`role:${role}`).emit(event, data);
}

export function broadcastRealtime(event: string, data: any): void {
  getRealTimeIO().emit(event, data);
}
