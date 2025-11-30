// server/src/routes/studentRoutes.ts
import { Router } from 'express';
import { registerStudent, getStudents, deleteStudent } from '../controllers/studentController'; // Import deleteStudent
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/register', upload.single('profileImage'), registerStudent);
router.get('/', getStudents);
router.delete('/:id', deleteStudent); // <--- Add this line

export default router;