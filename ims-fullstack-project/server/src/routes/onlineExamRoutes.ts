// server/src/routes/onlineExamRoutes.ts
import { Router } from 'express';
import { 
    getTeacherTests, 
    createTest, 
    addQuestion, 
    addBulkQuestions, 
    deleteTest 
} from '../controllers/onlineExamController'; 
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/online-exams
 * @desc    Fetch all tests/exams created by the logged-in teacher
 */
router.get('/', protect, getTeacherTests);

/**
 * @route   POST /api/online-exams
 * @desc    Initialize a new online exam session
 */
router.post('/', protect, createTest);

/**
 * @route   POST /api/online-exams/question
 * @desc    Add a single question to an existing exam
 */
router.post('/question', protect, addQuestion); 

/**
 * @route   POST /api/online-exams/questions/bulk
 * @desc    NEW: Add multiple questions at once via JSON/Array
 */
router.post('/questions/bulk', protect, addBulkQuestions);

/**
 * @route   DELETE /api/online-exams/:id
 * @desc    Permanently remove an exam and its associated questions
 */
router.delete('/:id', protect, deleteTest);

export default router;