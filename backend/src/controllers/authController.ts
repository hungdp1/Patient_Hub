import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { authService } from '../services/AuthService';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  const result = await authService.register({ email, password, firstName, lastName, role });
  res.status(201).json(result);
});
