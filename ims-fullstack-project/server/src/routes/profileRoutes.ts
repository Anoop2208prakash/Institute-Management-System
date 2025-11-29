// server/src/routes/profileRoutes.ts
import { Router } from 'express';
import { getMyProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/me', authenticate, getMyProfile);

export default router;