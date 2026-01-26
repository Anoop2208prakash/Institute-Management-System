// server/src/routes/activityRoutes.ts
import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const logs = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 entries for performance
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;