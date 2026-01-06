// server/src/routes/studentRoutes.ts
import { Router } from 'express';
import { 
    registerStudent, 
    getStudents, 
    updateStudent, 
    deleteStudent,
    getMySubjects,
    getMyAttendance,
    getMyResults,
    getMyInvoices,
    getAdmitCard
} from '../controllers/studentController';
import { protect, authorize } from '../middlewares/auth'; 
import { upload } from '../middlewares/upload';

const router = Router();

/**
 * --- ADMIN ROUTES ---
 * Access restricted to Administrative roles. 
 * 'getStudents' is the critical endpoint for your directory view.
 */
router.post('/register', protect, authorize('super_admin', 'admin'), upload.single('profileImage'), registerStudent);

// Check: Ensure the frontend is hitting this exact endpoint
router.get('/', protect, authorize('super_admin', 'admin'), getStudents);

router.put('/:id', protect, authorize('super_admin', 'admin'), updateStudent);
router.delete('/:id', protect, authorize('super_admin', 'admin'), deleteStudent);

/**
 * --- STUDENT PORTAL ROUTES ---
 * Access restricted to students for viewing their own data.
 */
router.get('/my-subjects', protect, authorize('student'), getMySubjects);
router.get('/my-attendance', protect, authorize('student'), getMyAttendance);
router.get('/my-results', protect, authorize('student'), getMyResults);
router.get('/my-invoices', protect, authorize('student'), getMyInvoices);
router.get('/admit-card', protect, authorize('student'), getAdmitCard);

export default router;