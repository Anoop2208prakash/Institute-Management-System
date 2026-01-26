// server/src/routes/staffRoutes.ts
import { Router } from 'express';
import { registerStaff, getAllStaff, deleteStaff } from '../controllers/staffController';
import { upload } from '../middlewares/upload'; // Use your Cloudinary upload middleware

const router = Router();

// FIXED: Use 'avatar' as the field name to match StaffRegister.tsx
router.post('/register', upload.single('avatar'), registerStaff);
router.get('/', getAllStaff);
router.delete('/:id', deleteStaff);

export default router;