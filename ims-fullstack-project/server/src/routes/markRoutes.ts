// server/src/routes/markRoutes.ts
import { Router } from 'express';
import { getTeacherExams, getMarksSheet, saveMarks } from '../controllers/markController';
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/marks/exams
 * @desc    Get all exams assigned to the logged-in teacher for grading
 */
router.get('/exams', protect, getTeacherExams);

/**
 * @route   GET /api/marks/sheet/:examId
 * @desc    Fetch the grading sheet (student list) for a specific exam
 */
router.get('/sheet/:examId', protect, getMarksSheet);

/**
 * @route   POST /api/marks
 * @desc    Submit or update marks for students in a specific exam
 */
router.post('/', protect, saveMarks);

export default router;