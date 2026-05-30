import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  payosConfig,
  createPayOSLink,
  payosWebhook,
  checkPayOSStatus,
} from '../controllers/payosController';

const router = Router();

// Public — frontend asks if PayOS is configured (no secrets exposed).
router.get('/config', payosConfig);

// Public — PayOS server calls this. Signature is verified inside the handler.
router.post('/webhook', payosWebhook);

// Authenticated — patient creates a checkout link for their own payment.
router.post('/payments/:paymentId/link', authMiddleware, createPayOSLink);
router.get('/payments/:paymentId/status', authMiddleware, checkPayOSStatus);

export default router;
