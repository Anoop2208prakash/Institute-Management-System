// server/src/routes/teacherRoutes.ts
import { Router } from 'express';
import { getMySubjects, markAttendance, enterMarks } from '../controllers/teacherController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Updated Endpoint
router.get('/my-subjects', authenticate, getMySubjects);

router.post('/attendance', authenticate, markAttendance);
router.post('/marks', authenticate, enterMarks);

export default router;