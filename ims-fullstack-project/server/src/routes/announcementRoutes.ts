// server/src/routes/announcementRoutes.ts
import { Router } from 'express';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticate, createAnnouncement);

// --- MAKE SURE THIS LINE EXISTS ---
router.delete('/:id', authenticate, deleteAnnouncement); 

export default router;