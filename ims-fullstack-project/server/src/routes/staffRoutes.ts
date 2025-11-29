// server/src/routes/staffRoutes.ts
import { Router } from 'express';
import { registerStaff, getAllStaff, deleteStaff } from '../controllers/staffController';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/register', upload.single('profileImage'), registerStaff);
router.get('/', getAllStaff);
router.delete('/:id', deleteStaff); // <--- ADD THIS

export default router;