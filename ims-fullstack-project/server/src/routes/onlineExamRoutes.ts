// server/src/routes/onlineExamRoutes.ts
import { Router } from 'express';
import { 
    getTeacherTests, 
    createTest, 
    addQuestion, 
    addBulkQuestions, 
    deleteTest 
} from '../controllers/onlineExamController'; 
import { authenticate } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/online-exams
 * @desc    Fetch all tests/exams created by the logged-in teacher
 */
router.get('/', authenticate, getTeacherTests);

/**
 * @route   POST /api/online-exams
 * @desc    Initialize a new online exam session
 */
router.post('/', authenticate, createTest);

/**
 * @route   POST /api/online-exams/question
 * @desc    Add a single question to an existing exam
 */
router.post('/question', authenticate, addQuestion); 

/**
 * @route   POST /api/online-exams/questions/bulk
 * @desc    NEW: Add multiple questions at once via JSON/Array
 */
router.post('/questions/bulk', authenticate, addBulkQuestions);

/**
 * @route   DELETE /api/online-exams/:id
 * @desc    Permanently remove an exam and its associated questions
 */
router.delete('/:id', authenticate, deleteTest);

export default router;