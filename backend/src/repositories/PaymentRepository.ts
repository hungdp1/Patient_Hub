import prisma from '../lib/prismaClient';
import { Payment } from '@prisma/client';

export interface IPaymentRepository {
  findByUserId(userId: string): Promise<Payment[]>;
  create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
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
}

export const paymentRepository = new PaymentRepository();
