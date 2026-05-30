import { IUserRepository, userRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/errorHandler';

export interface IUserService {
  getProfile(userId: string): Promise<unknown>;
  updateProfile(userId: string, data: Partial<{ firstName: string; lastName: string; phoneNumber: string; address: string; city: string; country: string; }>): Promise<unknown>;
  getPatientDashboard(userId: string): Promise<unknown>;
}

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  public async getProfile(userId: string): Promise<unknown> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  public async updateProfile(userId: string, data: Partial<{ firstName: string; lastName: string; phoneNumber: string; address: string; city: string; country: string; }>): Promise<unknown> {
    return this.userRepository.updateUser(userId, data as any);
  }

  public async getPatientDashboard(userId: string): Promise<unknown> {
    const dashboard = await this.userRepository.getPatientDashboard(userId);
    if (!dashboard) {
      throw new ApiError(404, 'Patient dashboard not found');
    }
    return dashboard;
  }
}

export const userService = new UserService(userRepository);
