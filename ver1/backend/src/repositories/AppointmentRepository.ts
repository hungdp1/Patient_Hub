import prisma from '../lib/prismaClient';
import { Appointment } from '@prisma/client';
import { doctorPublicInclude, patientPublicInclude } from '../lib/publicSelects';

export interface IAppointmentRepository {
  create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  findMany(filter: { patientId?: string; userId?: string }): Promise<Appointment[]>;
  update(id: string, data: Partial<Appointment>): Promise<Appointment>;
  findAll(): Promise<Appointment[]>;
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
        patient: { include: patientPublicInclude },
        doctor: { include: doctorPublicInclude },
      },
      orderBy: { date: 'desc' },
    });
  }

  public async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return prisma.appointment.update({ where: { id }, data });
  }

  public async findAll(): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      include: {
        patient: { include: patientPublicInclude },
        doctor: { include: doctorPublicInclude },
      },
      orderBy: { date: 'desc' },
    });
  }
}

export const appointmentRepository = new AppointmentRepository();
