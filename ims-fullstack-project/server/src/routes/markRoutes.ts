// server/src/routes/markRoutes.ts
import { Router } from 'express';
import { getTeacherExams, getMarksSheet, saveMarks } from '../controllers/markController';
import { authenticate } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/marks/exams
 * @desc    Get all exams assigned to the logged-in teacher for grading
 */
router.get('/exams', authenticate, getTeacherExams);

/**
 * @route   GET /api/marks/sheet/:examId
 * @desc    Fetch the grading sheet (student list) for a specific exam
 */
router.get('/sheet/:examId', authenticate, getMarksSheet);

/**
 * @route   POST /api/marks
 * @desc    Submit or update marks for students in a specific exam
 */
router.post('/', authenticate, saveMarks);

export default router;