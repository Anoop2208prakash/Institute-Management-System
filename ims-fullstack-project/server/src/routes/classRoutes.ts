// server/src/routes/classRoutes.ts
import { Router } from 'express';
import { getClasses, createClass, deleteClass, updateClass } from '../controllers/classController';
import { protect, authorize } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/classes
 * @desc    Public: Allow anyone (including Inquiry Form) to fetch the list of programs [cite: 14, 38]
 */
router.get('/', getClasses);

/**
 * @route   ADMIN PROTECTED: Only Admins can modify programs [cite: 46, 47, 62]
 */
router.post('/', protect, authorize('super_admin', 'admin'), createClass);
router.put('/:id', protect, authorize('super_admin', 'admin'), updateClass);
router.delete('/:id', protect, authorize('super_admin', 'admin'), deleteClass);

export default router;