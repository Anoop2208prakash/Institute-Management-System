// server/src/routes/announcementRoutes.ts
import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/announcements
 * @desc    Fetch all active announcements
 * @access  Public (Standard for internal dashboards)
 */
router.get('/', getAnnouncements);

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement
 * @access  Private (Admin/Super Admin)
 */
router.post('/', authenticate, createAnnouncement);

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement by ID
 * @access  Private (Admin/Super Admin)
 */
router.delete('/:id', authenticate, deleteAnnouncement); 

export default router;