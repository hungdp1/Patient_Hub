import prisma from '../lib/prismaClient';
export class NotificationRepository {
    async findByUserId(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(id) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        });
    }
}
export const notificationRepository = new NotificationRepository();
//# sourceMappingURL=NotificationRepository.js.map