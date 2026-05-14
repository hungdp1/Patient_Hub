import prisma from '../lib/prismaClient';
import { Notification } from '@prisma/client';

export interface INotificationRepository {
  findByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
}

export class NotificationRepository implements INotificationRepository {
  public async findByUserId(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const notificationRepository = new NotificationRepository();
