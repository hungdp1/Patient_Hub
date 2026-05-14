import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { aiService } from '../services/aiService';

export const chatExtraction = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.extractEntitiesFromChat(req.body);
  res.json(result);
});

export const diagnosisPrediction = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.predictSpecialty(req.body);
  res.json(result);
});

export const schedulePrioritization = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.prioritizeAppointment(req.body);
  res.json(result);
});

export const doctorLoadBalancing = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.balanceDoctorLoad(req.body);
  res.json(result);
});
