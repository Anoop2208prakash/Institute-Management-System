import { Router } from 'express';
import { getTeacherClasses, getAttendanceSheet, saveAttendance } from '../controllers/attendanceController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/meta', authenticate, getTeacherClasses); // Get dropdown data
router.get('/sheet', authenticate, getAttendanceSheet); // Get students grid
router.post('/', authenticate, saveAttendance); // Save

export default router;