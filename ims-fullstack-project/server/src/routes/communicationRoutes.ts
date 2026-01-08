// server/src/routes/communicationRoutes.ts
import express from 'express';
import { 
    getComplaints, 
    updateComplaintStatus 
} from '../controllers/communicationController';
import { protect } from '../middlewares/auth';

const router = express.Router();

/**
 * @route   GET /api/communication/complaints
 * @desc    Fetch all student grievances for the admin dashboard
 * @access  Private (Admin/Staff)
 */
router.get('/complaints', protect, getComplaints);

/**
 * @route   PATCH /api/communication/complaints/:id/status
 * @desc    Update the resolution status of a specific complaint
 * @access  Private (Admin/Staff)
 */
router.patch('/complaints/:id/status', protect, updateComplaintStatus);

export default router;