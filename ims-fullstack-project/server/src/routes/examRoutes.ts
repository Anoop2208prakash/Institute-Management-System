// server/src/routes/examRoutes.ts
import { Router } from 'express';
import { getExams, createExam, deleteExam } from '../controllers/examController';

const router = Router();

router.get('/', getExams);
router.post('/', createExam);
router.delete('/:id', deleteExam);

export default router;