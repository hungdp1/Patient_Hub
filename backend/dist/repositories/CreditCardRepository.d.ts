import { CreditCard } from '@prisma/client';
export interface ICreditCardRepository {
    findByUserId(userId: string): Promise<CreditCard[]>;
    create(data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreditCard>;
}
export declare class CreditCardRepository implements ICreditCardRepository {
    findByUserId(userId: string): Promise<CreditCard[]>;
    create(data: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreditCard>;
}
export declare const creditCardRepository: CreditCardRepository;
//# sourceMappingURL=CreditCardRepository.d.ts.map