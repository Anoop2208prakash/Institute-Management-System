import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/activity
router.get('/', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      take: 10,                      // Fetch top 10
      orderBy: { createdAt: 'desc' } // Newest first
    });
    res.json(activities);
  } catch (error) {
    console.error("Activity API Error:", error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;