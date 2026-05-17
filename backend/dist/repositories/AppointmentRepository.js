import prisma from '../lib/prismaClient';
export class AppointmentRepository {
    async create(data) {
        return prisma.appointment.create({ data });
    }
    async findMany(filter) {
        return prisma.appointment.findMany({
            where: filter.patientId ? { patientId: filter.patientId } : { userId: filter.userId },
            include: {
                patient: true,
                doctor: { include: { user: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async update(id, data) {
        return prisma.appointment.update({ where: { id }, data });
    }
}
export const appointmentRepository = new AppointmentRepository();
//# sourceMappingURL=AppointmentRepository.js.map