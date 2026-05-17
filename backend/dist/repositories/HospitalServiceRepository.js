import prisma from '../lib/prismaClient';
export class HospitalServiceRepository {
    async findActiveServices() {
        return prisma.hospitalService.findMany({
            where: { isActive: true },
        });
    }
}
export const hospitalServiceRepository = new HospitalServiceRepository();
//# sourceMappingURL=HospitalServiceRepository.js.map