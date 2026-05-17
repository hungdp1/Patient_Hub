import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errorHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { userRepository } from '../repositories/UserRepository';
import { auditRepository } from '../repositories/AuditRepository';
import { UserRole } from '@prisma/client';
export class AuthService {
    constructor(userRepository, auditRepository) {
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
    }
    createToken(payload) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ApiError(500, 'JWT secret is not configured');
        }
        return jwt.sign(payload, secret, {
            expiresIn: process.env.JWT_EXPIRATION || '7d',
        });
    }
    async findUserByIdentifier(input) {
        if (input.email) {
            const user = await this.userRepository.findByEmail(input.email);
            if (user)
                return user;
        }
        if (input.phoneNumber) {
            return this.userRepository.findByPhoneNumber(input.phoneNumber);
        }
        return null;
    }
    async login(input) {
        const user = await this.findUserByIdentifier({ email: input.email, phoneNumber: input.phoneNumber });
        if (!user || !user.passwordHash) {
            throw new ApiError(401, 'Invalid credentials');
        }
        const isValid = await comparePassword(input.password, user.passwordHash);
        if (!isValid) {
            throw new ApiError(401, 'Invalid credentials');
        }
        const token = this.createToken({ id: user.id, role: user.role });
        await this.auditRepository.create({
            userId: user.id,
            entity: 'User',
            entityId: user.id,
            action: 'LOGIN',
            description: 'User login successful',
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }
    async register(input) {
        const email = input.email?.trim() || `${input.phoneNumber.replace(/\D/g, '')}@patienthub.local`;
        const existingByEmail = await this.userRepository.findByEmail(email);
        if (existingByEmail) {
            throw new ApiError(400, 'Email already exists');
        }
        const existingByPhone = await this.userRepository.findByPhoneNumber(input.phoneNumber);
        if (existingByPhone) {
            throw new ApiError(400, 'Phone number already registered');
        }
        const passwordHash = await hashPassword(input.password);
        const userData = {
            email,
            phoneNumber: input.phoneNumber,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            role: input.role || UserRole.PATIENT,
        };
        const user = await this.userRepository.createUser(userData);
        if (user.role === UserRole.PATIENT) {
            await this.userRepository.createPatient(user.id);
        }
        await this.auditRepository.create({
            userId: user.id,
            entity: 'User',
            entityId: user.id,
            action: 'CREATE',
            description: 'New user registered',
            resourceAfter: JSON.stringify({ email: user.email, role: user.role }),
        });
        const token = this.createToken({ id: user.id, role: user.role });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }
}
export const authService = new AuthService(userRepository, auditRepository);
//# sourceMappingURL=AuthService.js.map