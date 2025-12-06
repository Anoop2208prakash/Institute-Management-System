import { Router } from 'express';
import { 
  registerStudent, getStudents, deleteStudent,
  getMySubjects, getMyAttendance, getMyResults, getMyInvoices, getAdmitCard
} from '../controllers/studentController';
import { upload } from '../middlewares/upload';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Admin Routes
router.post('/register', upload.single('profileImage'), registerStudent);
router.get('/', getStudents);
router.delete('/:id', deleteStudent);

// Student Portal Routes (Self Access)
router.get('/my-subjects', authenticate, getMySubjects);
router.get('/my-attendance', authenticate, getMyAttendance);
router.get('/my-results', authenticate, getMyResults);
router.get('/my-invoices', authenticate, getMyInvoices);
router.get('/admit-card', authenticate, getAdmitCard);

export default router;