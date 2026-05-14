import prisma from '../lib/prismaClient';
import { Appointment } from '@prisma/client';

export interface IAppointmentRepository {
  create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  findMany(filter: { patientId?: string; userId?: string }): Promise<Appointment[]>;
  update(id: string, data: Partial<Appointment>): Promise<Appointment>;
}

export class AppointmentRepository implements IAppointmentRepository {
  public async create(
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Appointment> {
    return prisma.appointment.create({ data });
  }

  public async findMany(filter: { patientId?: string; userId?: string }): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: filter.patientId ? { patientId: filter.patientId } : { userId: filter.userId },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  public async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return prisma.appointment.update({ where: { id }, data });
  }
}

export const appointmentRepository = new AppointmentRepository();
