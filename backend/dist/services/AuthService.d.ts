import { IUserRepository } from '../repositories/UserRepository';
import { IAuditRepository } from '../repositories/AuditRepository';
import { UserRole } from '@prisma/client';
export interface AuthResult {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}
export interface IAuthService {
    login(input: {
        email?: string;
        phoneNumber?: string;
        password: string;
    }): Promise<AuthResult>;
    register(input: {
        email?: string;
        phoneNumber: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: UserRole;
    }): Promise<AuthResult>;
}
export declare class AuthService implements IAuthService {
    private userRepository;
    private auditRepository;
    constructor(userRepository: IUserRepository, auditRepository: IAuditRepository);
    private createToken;
    private findUserByIdentifier;
    login(input: {
        email?: string;
        phoneNumber?: string;
        password: string;
    }): Promise<AuthResult>;
    register(input: {
        email?: string;
        phoneNumber: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: UserRole;
    }): Promise<AuthResult>;
}
export declare const authService: AuthService;
//# sourceMappingURL=AuthService.d.ts.map