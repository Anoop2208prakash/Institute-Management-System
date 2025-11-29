// server/src/routes/staffRoutes.ts
import { Router } from 'express';
import { registerStaff } from '../controllers/staffController';
import { upload } from '../middlewares/upload';

const router = Router();

// POST /api/staff/register
// 'profileImage' must match the formData.append name in React
router.post('/register', upload.single('profileImage'), registerStaff);

export default router;