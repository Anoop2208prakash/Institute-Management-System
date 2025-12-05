import { Router } from 'express';
import { getTeacherExams, getMarksSheet, saveMarks } from '../controllers/markController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/exams', authenticate, getTeacherExams);
router.get('/sheet/:examId', authenticate, getMarksSheet);
router.post('/', authenticate, saveMarks);

export default router;