// server/src/routes/classRoutes.ts
import { Router } from 'express';
import { getClasses, createClass, deleteClass, updateClass } from '../controllers/classController';

const router = Router();

router.get('/', getClasses);
router.post('/', createClass);
router.put('/:id', updateClass); // <--- Register Update Route
router.delete('/:id', deleteClass);

export default router;