// server/src/routes/profileRoutes.ts
import { Router } from 'express';
import { getProfile, updateMyProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth'; 
import { upload } from '../middlewares/upload'; 

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Fetch personal profile data. 
 * ALIGNED: Changed from '/me' to '/' to match frontend call
 * @access  Private
 */
router.get('/', authenticate, getProfile);

/**
 * @route   GET /api/profile/me
 * @desc    Alias for /me if needed for other parts of the system
 */
router.get('/me', authenticate, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update personal profile and upload a new avatar
 * @access  Private
 */
router.put('/', authenticate, upload.single('avatar'), updateMyProfile);

export default router;