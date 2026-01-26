// server/src/routes/authRoutes.ts
import { Router } from 'express';
import { login, register } from '../controllers/authController'; // Added 'register'
import { upload } from '../middlewares/upload'; // Import the Cloudinary upload middleware

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with a profile image
 * @access  Public (or protected if you want only Admins to create users)
 */
// The 'avatar' string here must match the field name in your Frontend FormData
router.post('/register', upload.single('avatar'), register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

export default router;