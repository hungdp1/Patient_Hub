import { Payment } from '@prisma/client';
export interface IPaymentRepository {
    findByUserId(userId: string): Promise<Payment[]>;
    create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
}
export declare class PaymentRepository implements IPaymentRepository {
    findByUserId(userId: string): Promise<Payment[]>;
    create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
}
export declare const paymentRepository: PaymentRepository;
//# sourceMappingURL=PaymentRepository.d.ts.map