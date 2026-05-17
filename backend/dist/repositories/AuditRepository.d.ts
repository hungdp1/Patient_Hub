import { AuditLog } from '@prisma/client';
export interface IAuditRepository {
    create(log: {
        userId: string;
        entity: string;
        entityId: string;
        action: string;
        description?: string;
        resourceBefore?: string;
        resourceAfter?: string;
        changes?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog>;
}
export declare class AuditRepository implements IAuditRepository {
    create(log: {
        userId: string;
        entity: string;
        entityId: string;
        action: string;
        description?: string;
        resourceBefore?: string;
        resourceAfter?: string;
        changes?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog>;
}
export declare const auditRepository: AuditRepository;
//# sourceMappingURL=AuditRepository.d.ts.map