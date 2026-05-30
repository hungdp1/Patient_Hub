import prisma from '../lib/prismaClient';
import { MedicalRecord } from '@prisma/client';
import { doctorPublicInclude, patientPublicInclude } from '../lib/publicSelects';

export interface MedicalRecordFilter {
  /** Filter by Patient.id (the medical-record FK). */
  patientId?: string;
  /** Filter by the owning patient's User.id — convenient for patient-scoped lookups. */
  userId?: string;
}

export interface IMedicalRecordRepository {
  findMany(filter: MedicalRecordFilter): Promise<MedicalRecord[]>;
  create(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord>;
  update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord>;
  findById(id: string): Promise<MedicalRecord | null>;
}

export class MedicalRecordRepository implements IMedicalRecordRepository {
  public async findMany(filter: MedicalRecordFilter): Promise<MedicalRecord[]> {
    const where: any = {};
    if (filter.patientId) where.patientId = filter.patientId;
    // Resolve by User.id (patient.userId) — used for self-service patient queries.
    if (filter.userId) where.patient = { userId: filter.userId };

    return prisma.medicalRecord.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        doctor: { include: doctorPublicInclude },
        patient: { include: patientPublicInclude },
      },
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
