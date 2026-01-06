// server/src/routes/attendanceRoutes.ts
import { Router } from 'express';
import { getTeacherClasses, getAttendanceSheet, saveAttendance } from '../controllers/attendanceController';
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/attendance/meta
 * @desc    Get dropdown data (classes/subjects) for the teacher
 */
router.get('/meta', protect, getTeacherClasses); 

/**
 * @route   GET /api/attendance/sheet
 * @desc    Get student grid for marking attendance
 */
router.get('/sheet', protect, getAttendanceSheet); 

/**
 * @route   POST /api/attendance
 * @desc    Save/Submit attendance records
 */
router.post('/', protect, saveAttendance); 

export default router;