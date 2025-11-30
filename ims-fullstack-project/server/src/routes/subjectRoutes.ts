// server/src/routes/subjectRoutes.ts
import { Router } from 'express';
import { getSubjects, createSubject, deleteSubject } from '../controllers/subjectController';

const router = Router();

router.get('/', getSubjects);
router.post('/', createSubject);
router.delete('/:id', deleteSubject);

export default router;