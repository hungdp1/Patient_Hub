/**
 * Real-time WebSocket Server Setup
 * Handles live notifications, appointments, chat, and data synchronization
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface RealTimeUser {
  userId: string;
  socketId: string;
  userRole: string;
  isOnline: boolean;
  lastSeen: Date;
}

class RealTimeServer {
  private io: Server;
  private activeUsers: Map<string, RealTimeUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // JWT Authentication Middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error: any) {
        next(new Error('Invalid token: ' + error.message));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User connected: ${socket.userId} (${socket.userRole})`);

      // Track user
      if (socket.userId) {
        this.trackUser(socket);
        this.broadcastUserOnline(socket.userId);
      }

      // === USER PRESENCE EVENTS ===
      socket.on('user:online', () => this.handleUserOnline(socket));
      socket.on('user:offline', () => this.handleUserOffline(socket));

      // === APPOINTMENT EVENTS ===
      socket.on('appointment:create', (data) => this.handleAppointmentCreate(socket, data));
      socket.on('appointment:update', (data) => this.handleAppointmentUpdate(socket, data));
      socket.on('appointment:cancel', (data) => this.handleAppointmentCancel(socket, data));

      // === NOTIFICATION EVENTS ===
      socket.on('notification:send', (data) => this.handleNotificationSend(socket, data));
      socket.on('notification:read', (data) => this.handleNotificationRead(socket, data));

      // === CHAT EVENTS ===
      socket.on('chat:message', (data) => this.handleChatMessage(socket, data));
      socket.on('chat:typing', (data) => this.handleChatTyping(socket, data));

      // === MEDICAL DATA EVENTS ===
      socket.on('medical:record:update', (data) => this.handleMedicalRecordUpdate(socket, data));
      socket.on('lab:result:ready', (data) => this.handleLabResultReady(socket, data));

      // === DISCONNECT ===
      socket.on('disconnect', () => this.handleDisconnect(socket));

      // === ERROR HANDLING ===
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.userId}:`, error);
      });
    });
  }

  // ===== USER TRACKING =====
  private trackUser(socket: AuthenticatedSocket) {
    const user: RealTimeUser = {
      userId: socket.userId!,
      socketId: socket.id,
      userRole: socket.userRole!,
      isOnline: true,
      lastSeen: new Date(),
    };

    this.activeUsers.set(socket.id, user);

    // Track socket IDs per user (user might have multiple connections)
    const userSockets = this.userSockets.get(socket.userId!) || [];
    userSockets.push(socket.id);
    this.userSockets.set(socket.userId!, userSockets);

    socket.join(`user:${socket.userId}`); // Join personal room
    socket.join(`role:${socket.userRole}`); // Join role-based room
  }

  private handleUserOnline(socket: AuthenticatedSocket) {
    const user = this.activeUsers.get(socket.id);
    if (user) {
      user.isOnline = true;
      user.lastSeen = new Date();
      this.broadcastUserOnline(socket.userId!);
    }
  }

  private handleUserOffline(socket: AuthenticatedSocket) {
    const user = this.activeUsers.get(socket.id);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      this.broadcastUserOffline(socket.userId!);
    }
  }

  private broadcastUserOnline(userId: string) {
    this.io.emit('user:status', {
      userId,
      isOnline: true,
      timestamp: new Date(),
    });
  }

  private broadcastUserOffline(userId: string) {
    // Check if user has other active connections
    const userSockets = this.userSockets.get(userId) || [];
    const hasActiveConnection = userSockets.some(socketId => {
      const user = this.activeUsers.get(socketId);
      return user?.isOnline;
    });

    if (!hasActiveConnection) {
      this.io.emit('user:status', {
        userId,
        isOnline: false,
        timestamp: new Date(),
      });
    }
  }

  // ===== APPOINTMENT EVENTS =====
  private handleAppointmentCreate(socket: AuthenticatedSocket, data: any) {
    console.log(`📅 Appointment created by ${socket.userId}:`, data);

    // Send to patient
    this.io.to(`user:${data.patientId}`).emit('appointment:created', {
      appointmentId: data.id,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      date: data.date,
      reason: data.reason,
      createdBy: socket.userId,
      timestamp: new Date(),
    });

    // Send to doctor
    this.io.to(`user:${data.doctorId}`).emit('appointment:assigned', {
      appointmentId: data.id,
      patientId: data.patientId,
      patientName: data.patientName,
      date: data.date,
      reason: data.reason,
      timestamp: new Date(),
    });

    // Send to admin
    this.io.to('role:ADMIN').emit('appointment:created_admin', {
      appointmentId: data.id,
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: data.date,
      createdBy: socket.userId,
      timestamp: new Date(),
    });
  }

  private handleAppointmentUpdate(socket: AuthenticatedSocket, data: any) {
    console.log(`📅 Appointment updated by ${socket.userId}:`, data);

    this.io.emit('appointment:updated', {
      appointmentId: data.id,
      status: data.status,
      updatedBy: socket.userId,
      timestamp: new Date(),
    });

    // Send notifications to involved parties
    this.io.to(`user:${data.patientId}`).emit('appointment:status_changed', {
      appointmentId: data.id,
      newStatus: data.status,
      message: `Your appointment status is now ${data.status}`,
    });

    if (data.doctorId) {
      this.io.to(`user:${data.doctorId}`).emit('appointment:status_changed', {
        appointmentId: data.id,
        newStatus: data.status,
      });
    }
  }

  private handleAppointmentCancel(socket: AuthenticatedSocket, data: any) {
    console.log(`❌ Appointment cancelled by ${socket.userId}:`, data);

    this.io.emit('appointment:cancelled', {
      appointmentId: data.id,
      reason: data.reason,
      cancelledBy: socket.userId,
      timestamp: new Date(),
    });

    this.io.to(`user:${data.patientId}`).emit('notification:appointment_cancelled', {
      appointmentId: data.id,
      reason: data.reason,
      message: 'Your appointment has been cancelled',
    });
  }

  // ===== NOTIFICATION EVENTS =====
  private handleNotificationSend(socket: AuthenticatedSocket, data: any) {
    console.log(`🔔 Notification sent by ${socket.userId}`);

    if (data.targetUserId) {
      this.io.to(`user:${data.targetUserId}`).emit('notification:received', {
        notificationId: data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.data,
        timestamp: new Date(),
        isRead: false,
      });
    } else if (data.targetRole) {
      this.io.to(`role:${data.targetRole}`).emit('notification:received', {
        notificationId: data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        timestamp: new Date(),
      });
    }
  }

  private handleNotificationRead(socket: AuthenticatedSocket, data: any) {
    this.io.to(`user:${socket.userId}`).emit('notification:marked_read', {
      notificationId: data.notificationId,
      timestamp: new Date(),
    });
  }

  // ===== CHAT EVENTS =====
  private handleChatMessage(socket: AuthenticatedSocket, data: any) {
    console.log(`💬 Chat message from ${socket.userId}`);

    if (data.recipientId) {
      // Direct message
      this.io.to(`user:${data.recipientId}`).emit('chat:message_received', {
        messageId: data.id,
        senderId: socket.userId,
        senderName: data.senderName,
        message: data.message,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });
    } else if (data.roomId) {
      // Group chat/room message
      this.io.to(`chat:${data.roomId}`).emit('chat:message_received', {
        messageId: data.id,
        senderId: socket.userId,
        senderName: data.senderName,
        message: data.message,
        roomId: data.roomId,
        timestamp: new Date(),
      });
    }

    socket.emit('chat:message_sent', {
      messageId: data.id,
      timestamp: new Date(),
    });
  }

  private handleChatTyping(socket: AuthenticatedSocket, data: any) {
    if (data.recipientId) {
      this.io.to(`user:${data.recipientId}`).emit('chat:user_typing', {
        userId: socket.userId,
        userName: data.userName,
      });
    } else if (data.roomId) {
      this.io.to(`chat:${data.roomId}`).emit('chat:user_typing', {
        userId: socket.userId,
        userName: data.userName,
      });
    }
  }

  // ===== MEDICAL DATA EVENTS =====
  private handleMedicalRecordUpdate(socket: AuthenticatedSocket, data: any) {
    console.log(`📋 Medical record updated by ${socket.userId}`);

    // Send to patient
    this.io.to(`user:${data.patientId}`).emit('medical:record:updated', {
      recordId: data.id,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      updatedAt: new Date(),
      updatedBy: socket.userId,
    });

    // Send to involved doctors
    if (data.doctorId) {
      this.io.to(`user:${data.doctorId}`).emit('medical:record:updated', {
        recordId: data.id,
        patientId: data.patientId,
        updatedAt: new Date(),
      });
    }
  }

  private handleLabResultReady(socket: AuthenticatedSocket, data: any) {
    console.log(`🧪 Lab result ready for ${data.patientId}`);

    // Send to patient
    this.io.to(`user:${data.patientId}`).emit('lab:result_available', {
      labId: data.id,
      testName: data.testName,
      status: 'COMPLETED',
      message: 'Your lab results are ready',
      timestamp: new Date(),
    });

    // Send to doctor
    if (data.doctorId) {
      this.io.to(`user:${data.doctorId}`).emit('lab:result_available', {
        labId: data.id,
        patientId: data.patientId,
        testName: data.testName,
      });
    }
  }

  // ===== DISCONNECT =====
  private handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`🔌 User disconnected: ${socket.userId}`);

    const user = this.activeUsers.get(socket.id);
    if (user) {
      this.activeUsers.delete(socket.id);

      // Remove socket from user's socket list
      const userSockets = this.userSockets.get(socket.userId!) || [];
      const filtered = userSockets.filter(sid => sid !== socket.id);
      if (filtered.length > 0) {
        this.userSockets.set(socket.userId!, filtered);
      } else {
        this.userSockets.delete(socket.userId!);
        this.broadcastUserOffline(socket.userId!);
      }
    }
  }

  // ===== UTILITY METHODS =====
  public getIO(): Server {
    return this.io;
  }

  public getActiveUsers(): RealTimeUser[] {
    return Array.from(this.activeUsers.values());
  }

  public getUserStatus(userId: string): 'online' | 'offline' {
    const userSockets = this.userSockets.get(userId) || [];
    const isOnline = userSockets.some(socketId => {
      const user = this.activeUsers.get(socketId);
      return user?.isOnline;
    });
    return isOnline ? 'online' : 'offline';
  }

  public notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public notifyRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  public broadcastAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}

export default RealTimeServer;
