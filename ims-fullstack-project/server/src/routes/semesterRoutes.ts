// server/src/routes/semesterRoutes.ts
import { Router } from 'express';
import { getSemesters, createSemester, deleteSemester } from '../controllers/semesterController';

const router = Router();

router.get('/', getSemesters);
router.post('/', createSemester);
router.delete('/:id', deleteSemester);

export default router;