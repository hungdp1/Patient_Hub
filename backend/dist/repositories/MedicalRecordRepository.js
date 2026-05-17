import prisma from '../lib/prismaClient';
export class MedicalRecordRepository {
    async findMany(filter) {
        return prisma.medicalRecord.findMany({
            where: filter.patientId ? { patientId: filter.patientId } : undefined,
            include: { doctor: { include: { user: true } } },
            orderBy: { recordDate: 'desc' },
        });
    }
    async create(data) {
        return prisma.medicalRecord.create({ data });
    }
    async update(id, data) {
        return prisma.medicalRecord.update({ where: { id }, data });
    }
    async findById(id) {
        return prisma.medicalRecord.findUnique({ where: { id } });
    }
}
export const medicalRecordRepository = new MedicalRecordRepository();
//# sourceMappingURL=MedicalRecordRepository.js.map