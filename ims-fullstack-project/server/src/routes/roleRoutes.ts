// server/src/routes/roleRoutes.ts
import { Router } from 'express';
import { getRoles, createRole, deleteRole } from '../controllers/roleController';

const router = Router();

router.get('/', getRoles);
router.post('/', createRole);
router.delete('/:id', deleteRole);

export default router; // <--- CRITICAL