import prisma from '../lib/prismaClient';
export class PrescriptionRepository {
    async findMany(filter) {
        return prisma.prescription.findMany({
            where: {
                ...(filter.patientId ? { patientId: filter.patientId } : {}),
                isActive: true,
            },
            include: {
                doctor: { include: { user: true } },
            },
            orderBy: { prescriptionDate: 'desc' },
        });
    }
    async create(data) {
        return prisma.prescription.create({ data });
    }
    async update(id, data) {
        return prisma.prescription.update({ where: { id }, data });
    }
}
export const prescriptionRepository = new PrescriptionRepository();
//# sourceMappingURL=PrescriptionRepository.js.map