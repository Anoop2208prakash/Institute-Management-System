// server/src/routes/announcementRoutes.ts
import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController';
import { protect } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

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
router.post('/', protect, createAnnouncement);

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement by ID
 * @access  Private (Admin/Super Admin)
 */
router.delete('/:id', protect, deleteAnnouncement); 

export default router;