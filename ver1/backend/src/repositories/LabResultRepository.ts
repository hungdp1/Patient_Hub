import prisma from '../lib/prismaClient';
import { LabResult } from '@prisma/client';
import { doctorPublicInclude, technicianPublicInclude } from '../lib/publicSelects';

export interface LabResultFilter {
  patientId?: string;
  userId?: string;
}

export interface ILabResultRepository {
  findMany(filter: LabResultFilter): Promise<LabResult[]>;
  create(data: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabResult>;
  update(id: string, data: Partial<LabResult>): Promise<LabResult>;
}

export class LabResultRepository implements ILabResultRepository {
  public async findMany(filter: LabResultFilter): Promise<LabResult[]> {
    const where: any = {};
    if (filter.patientId) where.patientId = filter.patientId;
    if (filter.userId) where.patient = { userId: filter.userId };

    return prisma.labResult.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        doctor: { include: doctorPublicInclude },
        technician: { include: technicianPublicInclude },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  public async create(
    data: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<LabResult> {
    return prisma.labResult.create({ data });
  }

  public async update(id: string, data: Partial<LabResult>): Promise<LabResult> {
    return prisma.labResult.update({ where: { id }, data });
  }
}

export const labResultRepository = new LabResultRepository();
