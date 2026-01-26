// server/src/routes/dashboardRoutes.ts
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/dashboard
 * @desc    Fetch aggregated statistics for the administrative dashboard
 * @access  Private
 */
router.get('/', authenticate, getDashboardStats);

export default router;