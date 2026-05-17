import { LabResult } from '@prisma/client';
export interface ILabResultRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<LabResult[]>;
    create(data: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabResult>;
    update(id: string, data: Partial<LabResult>): Promise<LabResult>;
}
export declare class LabResultRepository implements ILabResultRepository {
    findMany(filter: {
        patientId?: string;
    }): Promise<LabResult[]>;
    create(data: Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabResult>;
    update(id: string, data: Partial<LabResult>): Promise<LabResult>;
}
export declare const labResultRepository: LabResultRepository;
//# sourceMappingURL=LabResultRepository.d.ts.map