import prisma from '../lib/prismaClient';
import { Prescription } from '@prisma/client';
import { doctorPublicInclude } from '../lib/publicSelects';

export interface PrescriptionFilter {
  patientId?: string;
  userId?: string;
}

export interface IPrescriptionRepository {
  findMany(filter: PrescriptionFilter): Promise<Prescription[]>;
  create(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription>;
  update(id: string, data: Partial<Prescription>): Promise<Prescription>;
}

export class PrescriptionRepository implements IPrescriptionRepository {
  public async findMany(filter: PrescriptionFilter): Promise<Prescription[]> {
    const where: any = { isActive: true };
    if (filter.patientId) where.patientId = filter.patientId;
    if (filter.userId) where.patient = { userId: filter.userId };

    return prisma.prescription.findMany({
      where,
      include: { doctor: { include: doctorPublicInclude } },
      orderBy: { prescriptionDate: 'desc' },
    });
  }

  public async create(
    data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Prescription> {
    return prisma.prescription.create({ data });
  }

  public async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    return prisma.prescription.update({ where: { id }, data });
  }
}

export const prescriptionRepository = new PrescriptionRepository();
