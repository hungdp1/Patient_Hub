import prisma from '../lib/prismaClient';
import { LabResult } from '@prisma/client';

export interface ILabResultRepository {
  findMany(filter: { patientId?: string }): Promise<LabResult[]>;
  create(data: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabResult>;
  update(id: string, data: Partial<LabResult>): Promise<LabResult>;
}

export class LabResultRepository implements ILabResultRepository {
  public async findMany(filter: { patientId?: string }): Promise<LabResult[]> {
    return prisma.labResult.findMany({
      where: filter.patientId ? { patientId: filter.patientId } : undefined,
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
