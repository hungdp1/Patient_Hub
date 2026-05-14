import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/errorHandler';
import { userService } from '../services/UserService';

export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getProfile(req.userId!);
  res.json(user);
});

export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phoneNumber, address, city, country } = req.body;
  const user = await userService.updateProfile(req.userId!, {
    firstName,
    lastName,
    phoneNumber,
    address,
    city,
    country,
  });
  res.json(user);
});

export const getPatientDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dashboard = await userService.getPatientDashboard(req.userId!);
  res.json(dashboard);
});
