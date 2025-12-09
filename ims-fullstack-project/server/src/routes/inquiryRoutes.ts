// server/src/routes/inquiryRoutes.ts
import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiryController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/', createInquiry); // Public
router.get('/', authenticate, getInquiries); // Admin only
router.put('/:id/status', authenticate, updateInquiryStatus); // <--- NEW
router.delete('/:id', authenticate, deleteInquiry); // Admin only

export default router;