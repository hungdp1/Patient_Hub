import { Prescription } from '@prisma/client';
export interface IPrescriptionRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<Prescription[]>;
    create(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription>;
    update(id: string, data: Partial<Prescription>): Promise<Prescription>;
}
export declare class PrescriptionRepository implements IPrescriptionRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<Prescription[]>;
    create(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription>;
    update(id: string, data: Partial<Prescription>): Promise<Prescription>;
}
export declare const prescriptionRepository: PrescriptionRepository;
//# sourceMappingURL=PrescriptionRepository.d.ts.map