import { Router } from 'express';
import {
  chatExtraction,
  diagnosisPrediction,
  schedulePrioritization,
  doctorLoadBalancing,
} from '../controllers/aiController';

const router = Router();

router.post('/chat/extract', chatExtraction);
router.post('/diagnosis/predict', diagnosisPrediction);
router.post('/scheduling/prioritize', schedulePrioritization);
router.post('/load-balance', doctorLoadBalancing);

export default router;
