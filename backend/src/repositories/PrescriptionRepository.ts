import prisma from '../lib/prismaClient';
import { Prescription } from '@prisma/client';

export interface IPrescriptionRepository {
  findMany(filter: { patientId?: string }): Promise<Prescription[]>;
  create(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription>;
  update(id: string, data: Partial<Prescription>): Promise<Prescription>;
}

export class PrescriptionRepository implements IPrescriptionRepository {
  public async findMany(filter: { patientId?: string }): Promise<Prescription[]> {
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
