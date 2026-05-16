import prisma from '../lib/prismaClient';
import { Payment } from '@prisma/client';

export interface IPaymentRepository {
  findByUserId(userId: string): Promise<Payment[]>;
  create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  findPendingInvoices(): Promise<Payment[]>;
}

export class PaymentRepository implements IPaymentRepository {
  public async findByUserId(userId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  public async findPendingInvoices(): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }
}

export const paymentRepository = new PaymentRepository();
