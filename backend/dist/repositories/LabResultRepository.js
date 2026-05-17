import prisma from '../lib/prismaClient';
export class LabResultRepository {
    async findMany(filter) {
        return prisma.labResult.findMany({
            where: filter.patientId ? { patientId: filter.patientId } : undefined,
            orderBy: { testDate: 'desc' },
        });
    }
    async create(data) {
        return prisma.labResult.create({ data });
    }
    async update(id, data) {
        return prisma.labResult.update({ where: { id }, data });
    }
}
export const labResultRepository = new LabResultRepository();
//# sourceMappingURL=LabResultRepository.js.map