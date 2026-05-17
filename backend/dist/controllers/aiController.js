import { asyncHandler } from '../utils/errorHandler';
import { aiService } from '../services/aiService';
export const chatExtraction = asyncHandler(async (req, res) => {
    const result = await aiService.extractEntitiesFromChat(req.body);
    res.json(result);
});
export const chatResponse = asyncHandler(async (req, res) => {
    const result = await aiService.respondToChat(req.body);
    res.json(result);
});
export const diagnosisPrediction = asyncHandler(async (req, res) => {
    const result = await aiService.predictSpecialty(req.body);
    res.json(result);
});
export const schedulePrioritization = asyncHandler(async (req, res) => {
    const result = await aiService.prioritizeAppointment(req.body);
    res.json(result);
});
export const doctorLoadBalancing = asyncHandler(async (req, res) => {
    const result = await aiService.balanceDoctorLoad(req.body);
    res.json(result);
});
//# sourceMappingURL=aiController.js.map