// server/src/routes/attendanceRoutes.ts
import { Router } from 'express';
import { getTeacherClasses, getAttendanceSheet, saveAttendance } from '../controllers/attendanceController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/attendance/meta
 * @desc    Get dropdown data (classes/subjects) for the teacher
 */
router.get('/meta', authenticate, getTeacherClasses); 

/**
 * @route   GET /api/attendance/sheet
 * @desc    Get student grid for marking attendance
 */
router.get('/sheet', authenticate, getAttendanceSheet); 

/**
 * @route   POST /api/attendance
 * @desc    Save/Submit attendance records
 */
router.post('/', authenticate, saveAttendance); 

export default router;