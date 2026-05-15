import prisma from '../lib/prismaClient';
import { User, Patient, UserRole } from '@prisma/client';

export interface CreateUserData {
  email: string;
  phoneNumber: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  createPatient(userId: string): Promise<Patient>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getPatientDashboard(userId: string): Promise<Patient | null>;
}

export class UserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true },
    });
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phoneNumber },
      include: { patient: true, doctor: true },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
  }

  public async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  public async createPatient(userId: string): Promise<Patient> {
    return prisma.patient.create({ data: { userId } });
  }

  public async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  public async getPatientDashboard(userId: string): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { userId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        labResults: {
          orderBy: { testDate: 'desc' },
          take: 5,
        },
        prescriptions: {
          where: { isActive: true },
        },
      },
    });
  }
}

export const userRepository = new UserRepository();
