// server/src/routes/announcementRoutes.ts
import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticate, createAnnouncement); // Requires Auth to get Author ID
router.delete('/:id', deleteAnnouncement);

export default router;