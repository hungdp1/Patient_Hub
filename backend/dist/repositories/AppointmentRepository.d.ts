import { Appointment } from '@prisma/client';
export interface IAppointmentRepository {
    create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
    findMany(filter: {
        patientId?: string;
        userId?: string;
    }): Promise<Appointment[]>;
    update(id: string, data: Partial<Appointment>): Promise<Appointment>;
}
export declare class AppointmentRepository implements IAppointmentRepository {
    create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
    findMany(filter: {
        patientId?: string;
        userId?: string;
    }): Promise<Appointment[]>;
    update(id: string, data: Partial<Appointment>): Promise<Appointment>;
}
export declare const appointmentRepository: AppointmentRepository;
//# sourceMappingURL=AppointmentRepository.d.ts.map