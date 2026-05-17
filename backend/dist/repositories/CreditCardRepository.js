import prisma from '../lib/prismaClient';
export class CreditCardRepository {
    async findByUserId(userId) {
        return prisma.creditCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return prisma.creditCard.create({ data });
    }
}
export const creditCardRepository = new CreditCardRepository();
//# sourceMappingURL=CreditCardRepository.js.map