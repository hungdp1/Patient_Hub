import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    if (typeof decoded === 'object' && 'id' in decoded) {
      req.userId = decoded.id as string;
      req.userRole = (decoded as any).role as string;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const doctorOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'DOCTOR' && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Doctor access required' });
  }
  next();
};
