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

// FIXED: Changed 'protect' to 'authenticate'
import { authenticate, authorize } from '../middlewares/auth'; 
import { upload } from '../middlewares/upload';

const router = Router();

/**
 * --- ADMIN & SUPER ADMIN ROUTES ---
 * Access restricted to Administrative roles. 
 * FIXED: Wrapped roles in a single array to resolve "Expected 1 argument, but got 6"
 */

// POST: Student Registration (Includes Cloudinary Upload)
router.post(
    '/register', 
    authenticate, 
    authorize(['SUPER ADMIN', 'ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']), 
    upload.single('profileImage'), 
    registerStudent
);

// GET: Fetch Student Directory
router.get(
    '/', 
    authenticate, 
    authorize(['SUPER ADMIN', 'ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']), 
    getStudents
);

// PUT: Update Student Record
router.put(
    '/:id', 
    authenticate, 
    authorize(['SUPER ADMIN', 'ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']), 
    updateStudent
);

// DELETE: Remove Student
router.delete(
    '/:id', 
    authenticate, 
    authorize(['SUPER ADMIN', 'ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN']), 
    deleteStudent
);

/**
 * --- STUDENT PORTAL ROUTES ---
 * Access restricted to students for viewing their own data.
 */
router.get('/my-subjects', authenticate, authorize(['STUDENT']), getMySubjects);
router.get('/my-attendance', authenticate, authorize(['STUDENT']), getMyAttendance);
router.get('/my-results', authenticate, authorize(['STUDENT']), getMyResults);
router.get('/my-invoices', authenticate, authorize(['STUDENT']), getMyInvoices);
router.get('/admit-card', authenticate, authorize(['STUDENT']), getAdmitCard);

export default router;