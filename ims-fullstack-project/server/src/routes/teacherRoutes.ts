// server/src/routes/teacherRoutes.ts
import { Router } from 'express';
import { getMySubjects, markAttendance, enterMarks } from '../controllers/teacherController';
import { protect, authorize } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/teacher/my-subjects
 * @desc    Fetch all subjects and classes assigned to the logged-in teacher
 * @access  Private (Teacher)
 */
router.get('/my-subjects', protect, authorize('teacher'), getMySubjects);

/**
 * @route   POST /api/teacher/attendance
 * @desc    Submit daily attendance for a specific class/subject
 * @access  Private (Teacher)
 */
router.post('/attendance', protect, authorize('teacher'), markAttendance);

/**
 * @route   POST /api/teacher/marks
 * @desc    Enter or update student marks for assigned subjects
 * @access  Private (Teacher)
 */
router.post('/marks', protect, authorize('teacher'), enterMarks);

export default router;