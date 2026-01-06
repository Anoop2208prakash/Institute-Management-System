// server/src/routes/profileRoutes.ts
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController';
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect
import { upload } from '../middlewares/upload'; 

const router = Router();

/**
 * @route   GET /api/profile/me
 * @desc    Fetch personal profile data for the logged-in user
 * @access  Private
 */
router.get('/me', protect, getMyProfile);

/**
 * @route   PUT /api/profile/me
 * @desc    Update personal profile and upload a new avatar
 * @access  Private
 */
router.put('/me', protect, upload.single('avatar'), updateMyProfile);

export default router;