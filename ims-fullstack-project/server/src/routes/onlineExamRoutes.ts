import { Router } from 'express';
import { getTeacherTests, createTest, addQuestion, addBulkQuestions, deleteTest } from '../controllers/onlineExamController'; // Import new function
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getTeacherTests);
router.post('/', authenticate, createTest);
router.post('/question', authenticate, addQuestion); // Single
router.post('/questions/bulk', authenticate, addBulkQuestions); // <--- NEW BULK ROUTE
router.delete('/:id', authenticate, deleteTest);

export default router;