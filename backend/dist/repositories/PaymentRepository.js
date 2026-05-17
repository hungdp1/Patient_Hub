import prisma from '../lib/prismaClient';
export class PaymentRepository {
    async findByUserId(userId) {
        return prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return prisma.payment.create({ data });
    }
}
export const paymentRepository = new PaymentRepository();
//# sourceMappingURL=PaymentRepository.js.map