import { Notification } from '@prisma/client';
export interface INotificationRepository {
    findByUserId(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
}
export declare class NotificationRepository implements INotificationRepository {
    findByUserId(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
}
export declare const notificationRepository: NotificationRepository;
//# sourceMappingURL=NotificationRepository.d.ts.map