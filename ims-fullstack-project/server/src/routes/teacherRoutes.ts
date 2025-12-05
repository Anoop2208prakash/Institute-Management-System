// server/src/routes/teacherRoutes.ts
import { Router } from 'express';
import { getMyClass, markAttendance, enterMarks } from '../controllers/teacherController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// GET /api/teacher/my-class
router.get('/my-class', authenticate, getMyClass);

// POST /api/teacher/attendance
router.post('/attendance', authenticate, markAttendance);

// POST /api/teacher/marks
router.post('/marks', authenticate, enterMarks);

export default router;