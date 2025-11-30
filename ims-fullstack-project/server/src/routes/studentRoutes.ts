// server/src/routes/studentRoutes.ts
import { Router } from 'express';
import { registerStudent, getStudents } from '../controllers/studentController';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/register', upload.single('profileImage'), registerStudent);
router.get('/', getStudents);

export default router;