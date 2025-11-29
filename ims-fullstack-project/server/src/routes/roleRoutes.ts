// server/src/routes/roleRoutes.ts
import { Router } from 'express';
import { getRoles } from '../controllers/roleController';

const router = Router();

// GET /api/roles
router.get('/', getRoles);

export default router;