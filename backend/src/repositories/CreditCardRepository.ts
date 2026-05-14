import prisma from '../lib/prismaClient';
import { CreditCard } from '@prisma/client';

export interface ICreditCardRepository {
  findByUserId(userId: string): Promise<CreditCard[]>;
  create(data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreditCard>;
}

export class CreditCardRepository implements ICreditCardRepository {
  public async findByUserId(userId: string): Promise<CreditCard[]> {
    return prisma.creditCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async create(
    data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CreditCard> {
    return prisma.creditCard.create({ data });
  }
}

export const creditCardRepository = new CreditCardRepository();
