// server/src/routes/studentRoutes.ts
import { Router } from 'express';
import { 
  registerStudent, 
  getStudents, 
  deleteStudent,
  updateStudent, // <--- Import the new controller
  getMySubjects, 
  getMyAttendance, 
  getMyResults, 
  getMyInvoices, 
  getAdmitCard
} from '../controllers/studentController';
import { upload } from '../middlewares/upload';
import { authenticate } from '../middlewares/auth';

const router = Router();

// ==========================================
// ADMIN ROUTES (Manage Students)
// ==========================================
router.post('/register', upload.single('profileImage'), registerStudent);
router.get('/', getStudents);
router.put('/:id', updateStudent); // <--- New Route for Edit Modal
router.delete('/:id', deleteStudent);

// ==========================================
// STUDENT PORTAL ROUTES (Self Access)
// ==========================================
router.get('/my-subjects', authenticate, getMySubjects);
router.get('/my-attendance', authenticate, getMyAttendance);
router.get('/my-results', authenticate, getMyResults);
router.get('/my-invoices', authenticate, getMyInvoices);
router.get('/admit-card', authenticate, getAdmitCard);

export default router;