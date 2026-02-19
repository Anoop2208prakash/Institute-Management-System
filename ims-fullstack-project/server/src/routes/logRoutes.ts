import { Router } from 'express';
import { getSystemLogs } from '../controllers/logController';
import { authenticate } from '../middlewares/auth'; 

const router = Router();

// --- System Activity Logs ---

/**
 * @route   GET /api/logs
 * @desc    Admin Only: Fetch a unified timeline of all system activities
 * (Library loans, Complaints, and General actions)
 */
router.get('/', authenticate, getSystemLogs);

export default router;