// server/src/routes/profileRoutes.ts
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload'; // Import upload

const router = Router();

router.get('/me', authenticate, getMyProfile);

// PUT /api/profile/me (Allows file upload)
router.put('/me', authenticate, upload.single('avatar'), updateMyProfile);

export default router;