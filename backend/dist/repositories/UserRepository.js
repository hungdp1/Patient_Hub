import prisma from '../lib/prismaClient';
export class UserRepository {
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            include: { patient: true, doctor: true },
        });
    }
    async findByPhoneNumber(phoneNumber) {
        return prisma.user.findUnique({
            where: { phoneNumber },
            include: { patient: true, doctor: true },
        });
    }
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: { patient: true, doctor: true },
        });
    }
    async createUser(data) {
        return prisma.user.create({ data });
    }
    async createPatient(userId) {
        return prisma.patient.create({ data: { userId } });
    }
    async updateUser(id, data) {
        return prisma.user.update({ where: { id }, data });
    }
    async getPatientDashboard(userId) {
        return prisma.patient.findUnique({
            where: { userId },
            include: {
                appointments: {
                    orderBy: { date: 'desc' },
                    take: 5,
                },
                labResults: {
                    orderBy: { testDate: 'desc' },
                    take: 5,
                },
                prescriptions: {
                    where: { isActive: true },
                },
            },
        });
    }
}
export const userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map