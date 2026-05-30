import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { authService } from '../services/AuthService';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, phoneNumber, password } = req.body;
  const result = await authService.login({ email, phoneNumber, password });
  res.json({ success: true, message: 'Login successful', ...result });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, phoneNumber, password, firstName, lastName, fullName, role } = req.body;
  const parsedName = (fullName || '').trim().split(/\s+/);
  const resolvedFirstName = firstName || parsedName.shift() || 'Patient';
  const resolvedLastName = lastName || parsedName.join(' ') || 'User';

  const result = await authService.register({
    email,
    password,
    phoneNumber,
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    role,
  });

  res.status(201).json({ success: true, message: 'Registration successful', ...result });
});
