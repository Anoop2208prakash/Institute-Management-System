import { Router } from 'express';
import { 
    getComplaints, 
    updateComplaintStatus 
} from '../controllers/communicationController';

// FIXED: Add adminOnly to the import statement
import { protect, adminOnly } from '../middlewares/auth'; 

const router = Router();

// Routes will now correctly find the 'adminOnly' function
router.get('/complaints', protect, adminOnly, getComplaints);
router.patch('/complaints/:id/status', protect, adminOnly, updateComplaintStatus);

export default router;