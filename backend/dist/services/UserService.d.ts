import { IUserRepository } from '../repositories/UserRepository';
export interface IUserService {
    getProfile(userId: string): Promise<unknown>;
    updateProfile(userId: string, data: Partial<{
        firstName: string;
        lastName: string;
        phoneNumber: string;
        address: string;
        city: string;
        country: string;
    }>): Promise<unknown>;
    getPatientDashboard(userId: string): Promise<unknown>;
}
export declare class UserService implements IUserService {
    private userRepository;
    constructor(userRepository: IUserRepository);
    getProfile(userId: string): Promise<unknown>;
    updateProfile(userId: string, data: Partial<{
        firstName: string;
        lastName: string;
        phoneNumber: string;
        address: string;
        city: string;
        country: string;
    }>): Promise<unknown>;
    getPatientDashboard(userId: string): Promise<unknown>;
}
export declare const userService: UserService;
//# sourceMappingURL=UserService.d.ts.map