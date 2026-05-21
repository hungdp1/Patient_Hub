import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errorHandler';
import { aiService } from '../services/aiService';
import { medicalAIService } from '../services/MedicalAIService';

export const chatExtraction = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.extractEntitiesFromChat(req.body);
  res.json(result);
});

/**
 * POST /api/ai/chat — main entry point for the AI assistant.
 *
 * Requires auth: the model needs `userId` to scope personal-data lookups
 * (appointments, lab results, prescriptions, payments) to the logged-in
 * patient. Anonymous chat isn't supported because we don't want a random
 * caller asking "what are MY pending payments" — there is no "my" without
 * a user.
 */
export const chatResponse = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) throw new ApiError(401, 'Phải đăng nhập để dùng trợ lý AI');
  const { message } = req.body as { message?: string };
  if (!message || typeof message !== 'string') {
    throw new ApiError(400, 'Thiếu nội dung tin nhắn');
  }
  const result = await medicalAIService.chat({ userId: req.userId, message });
  res.json(result);
});

/**
 * GET /api/ai/config — lets the frontend tell whether the chat will be
 * "smart" (Gemini configured) or "fallback" (rule-based heuristics only).
 * Public — no secrets are leaked.
 */
export const aiConfig = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ smart: medicalAIService.isConfigured() });
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
