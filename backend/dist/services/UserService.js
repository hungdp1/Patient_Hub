import { userRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/errorHandler';
export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        return this.userRepository.updateUser(userId, data);
    }
    async getPatientDashboard(userId) {
        const dashboard = await this.userRepository.getPatientDashboard(userId);
        if (!dashboard) {
            throw new ApiError(404, 'Patient dashboard not found');
        }
        return dashboard;
    }
}
export const userService = new UserService(userRepository);
//# sourceMappingURL=UserService.js.map