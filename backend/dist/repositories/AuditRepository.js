import prisma from '../lib/prismaClient';
export class AuditRepository {
    async create(log) {
        return prisma.auditLog.create({ data: log });
    }
}
export const auditRepository = new AuditRepository();
//# sourceMappingURL=AuditRepository.js.map