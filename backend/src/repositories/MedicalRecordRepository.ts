import prisma from '../lib/prismaClient';
import { MedicalRecord } from '@prisma/client';

export interface IMedicalRecordRepository {
  findMany(filter: { patientId?: string }): Promise<MedicalRecord[]>;
  create(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord>;
  update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord>;
  findById(id: string): Promise<MedicalRecord | null>;
}

export class MedicalRecordRepository implements IMedicalRecordRepository {
  public async findMany(filter: { patientId?: string }): Promise<MedicalRecord[]> {
    return prisma.medicalRecord.findMany({
      where: filter.patientId ? { patientId: filter.patientId } : undefined,
      include: { doctor: { include: { user: true } } },
      orderBy: { recordDate: 'desc' },
    });
  }

  public async create(
    data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MedicalRecord> {
    return prisma.medicalRecord.create({ data });
  }

  public async update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return prisma.medicalRecord.update({ where: { id }, data });
  }

  public async findById(id: string): Promise<MedicalRecord | null> {
    return prisma.medicalRecord.findUnique({ where: { id } });
  }
}

export const medicalRecordRepository = new MedicalRecordRepository();
