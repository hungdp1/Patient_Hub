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
export declare class UserRepository implements IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createUser(data: CreateUserData): Promise<User>;
    createPatient(userId: string): Promise<Patient>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    getPatientDashboard(userId: string): Promise<Patient | null>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=UserRepository.d.ts.map