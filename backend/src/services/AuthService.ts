import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errorHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { IUserRepository, userRepository, CreateUserData } from '../repositories/UserRepository';
import { IAuditRepository, auditRepository } from '../repositories/AuditRepository';

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
  login(email: string, password: string): Promise<AuthResult>;
  register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<AuthResult>;
}

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private auditRepository: IAuditRepository,
  ) {}

  private createToken(payload: { id: string; role: string }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new ApiError(500, 'JWT secret is not configured');
    }

    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    });
  }

  public async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
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

  public async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(400, 'Email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const userData: CreateUserData = {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role || 'PATIENT',
    };

    const user = await this.userRepository.createUser(userData);
    if (user.role === 'PATIENT') {
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
