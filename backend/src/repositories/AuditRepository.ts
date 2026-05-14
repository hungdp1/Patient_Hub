import prisma from '../lib/prismaClient';
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

export class AuditRepository implements IAuditRepository {
  public async create(log: {
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
  }): Promise<AuditLog> {
    return prisma.auditLog.create({ data: log });
  }
}

export const auditRepository = new AuditRepository();
