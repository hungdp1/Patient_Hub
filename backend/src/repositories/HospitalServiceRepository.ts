import prisma from '../lib/prismaClient';

export interface IHospitalServiceRepository {
  findActiveServices(): Promise<unknown[]>;
}

export class HospitalServiceRepository implements IHospitalServiceRepository {
  public async findActiveServices(): Promise<unknown[]> {
    return prisma.hospitalService.findMany({
      where: { isActive: true },
    });
  }
}

export const hospitalServiceRepository = new HospitalServiceRepository();
