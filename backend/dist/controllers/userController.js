import { asyncHandler } from '../utils/errorHandler';
import { userService } from '../services/UserService';
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.userId);
    res.json(user);
});
export const updateUserProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phoneNumber, address, city, country } = req.body;
    const user = await userService.updateProfile(req.userId, {
        firstName,
        lastName,
        phoneNumber,
        address,
        city,
        country,
    });
    res.json(user);
});
export const getPatientDashboard = asyncHandler(async (req, res) => {
    const dashboard = await userService.getPatientDashboard(req.userId);
    res.json(dashboard);
});
//# sourceMappingURL=userController.js.map