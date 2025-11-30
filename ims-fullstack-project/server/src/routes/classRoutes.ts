// server/src/routes/classRoutes.ts
import { Router } from 'express';
import { getClasses, createClass, deleteClass } from '../controllers/classController';

const router = Router();

router.get('/', getClasses);
router.post('/', createClass);
router.delete('/:id', deleteClass);

export default router;