// server/src/routes/classRoutes.ts
import { Router } from 'express';
import { getClasses, createClass, deleteClass, updateClass } from '../controllers/classController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// PUBLIC: Allow anyone (including Inquiry Form) to fetch the list of programs
router.get('/', getClasses);

// PROTECTED: Only Admins can modify programs
router.post('/', authenticate, createClass);
router.put('/:id', authenticate, updateClass);
router.delete('/:id', authenticate, deleteClass);

export default router;