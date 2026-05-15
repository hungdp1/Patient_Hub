import { Router } from 'express';
import {
  chatExtraction,
  chatResponse,
  diagnosisPrediction,
  schedulePrioritization,
  doctorLoadBalancing,
} from '../controllers/aiController';

const router = Router();

router.post('/chat', chatResponse);
router.post('/chat/extract', chatExtraction);
router.post('/diagnosis/predict', diagnosisPrediction);
router.post('/scheduling/prioritize', schedulePrioritization);
router.post('/load-balance', doctorLoadBalancing);

export default router;
