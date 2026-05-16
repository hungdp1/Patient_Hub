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
  findAll(): Promise<AuditLog[]>;
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

  public async findAll(): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent 100 for admin
    });
  }
}

export const auditRepository = new AuditRepository();
