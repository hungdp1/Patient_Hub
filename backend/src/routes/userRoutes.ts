import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getUserProfile,
  updateUserProfile,
  getPatientDashboard,
} from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/dashboard', getPatientDashboard);

export default router;
