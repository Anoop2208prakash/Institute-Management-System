// server/src/routes/inquiryRoutes.ts
import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiryController';
import { authenticate } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   POST /api/inquiries
 * @desc    Public: Submit a new inquiry from the landing page
 */
router.post('/', createInquiry); 

/**
 * @route   GET /api/inquiries
 * @desc    Admin Only: Fetch all inquiries for lead management
 */
router.get('/', authenticate, getInquiries); 

/**
 * @route   PUT /api/inquiries/:id/status
 * @desc    Admin Only: Update the follow-up status of an inquiry
 */
router.put('/:id/status', authenticate, updateInquiryStatus); 

/**
 * @route   DELETE /api/inquiries/:id
 * @desc    Admin Only: Remove an inquiry record
 */
router.delete('/:id', authenticate, deleteInquiry); 

export default router;