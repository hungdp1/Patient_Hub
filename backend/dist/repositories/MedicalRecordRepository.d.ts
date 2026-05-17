import { MedicalRecord } from '@prisma/client';
export interface IMedicalRecordRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<MedicalRecord[]>;
    create(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord>;
    update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord>;
    findById(id: string): Promise<MedicalRecord | null>;
}
export declare class MedicalRecordRepository implements IMedicalRecordRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<MedicalRecord[]>;
    create(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord>;
    update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord>;
    findById(id: string): Promise<MedicalRecord | null>;
}
export declare const medicalRecordRepository: MedicalRecordRepository;
//# sourceMappingURL=MedicalRecordRepository.d.ts.map