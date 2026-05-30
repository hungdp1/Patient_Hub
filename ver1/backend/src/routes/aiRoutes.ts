import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  chatExtraction,
  chatResponse,
  diagnosisPrediction,
  schedulePrioritization,
  doctorLoadBalancing,
  aiConfig,
} from '../controllers/aiController';

const router = Router();

// Public — frontend uses this to render "smart vs fallback" badge.
router.get('/config', aiConfig);

// Everything below requires a logged-in user. The chat endpoint in particular
// needs `req.userId` to scope personal-data lookups (appointments, labs, etc).
router.use(authMiddleware);

router.post('/chat', chatResponse);
router.post('/chat/extract', chatExtraction);
router.post('/diagnosis/predict', diagnosisPrediction);
router.post('/scheduling/prioritize', schedulePrioritization);
router.post('/load-balance', doctorLoadBalancing);

export default router;
