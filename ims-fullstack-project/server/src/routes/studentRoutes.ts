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
 * --- ADMIN & SUPER ADMIN ROUTES ---
 * Access restricted to Administrative roles. 
 * Updated role strings to handle variations seen in your screenshots.
 */

// POST: Student Registration
router.post(
    '/register', 
    protect, 
    authorize('super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN', 'administrator', 'ADMINISTRATOR'), 
    upload.single('profileImage'), 
    registerStudent
);

// GET: Fetch Student Directory
router.get(
    '/', 
    protect, 
    authorize('super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN', 'administrator', 'ADMINISTRATOR'  ), 
    getStudents
);

// PUT: Update Student Record
router.put(
    '/:id', 
    protect, 
    authorize('super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN', 'administrator', 'ADMINISTRATOR'), 
    updateStudent
);

// DELETE: Remove Student
router.delete(
    '/:id', 
    protect, 
    authorize('super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN', 'administrator', 'ADMINISTRATOR'), 
    deleteStudent
);

/**
 * --- STUDENT PORTAL ROUTES ---
 * Access restricted to students for viewing their own data.
 */
router.get('/my-subjects', protect, authorize('student', 'STUDENT'), getMySubjects);
router.get('/my-attendance', protect, authorize('student', 'STUDENT'), getMyAttendance);
router.get('/my-results', protect, authorize('student', 'STUDENT'), getMyResults);
router.get('/my-invoices', protect, authorize('student', 'STUDENT'), getMyInvoices);
router.get('/admit-card', protect, authorize('student', 'STUDENT'), getAdmitCard);

export default router;