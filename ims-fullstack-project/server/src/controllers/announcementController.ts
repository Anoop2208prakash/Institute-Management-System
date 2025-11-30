// server/src/controllers/announcementController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// GET All Announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: { author: { include: { adminProfile: true, teacherProfile: true } } },
      orderBy: { date: 'desc' }
    });

    // Format data to show author name
    const formatted = announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        target: a.target,
        date: a.date,
        authorName: a.author.adminProfile?.fullName || a.author.teacherProfile?.fullName || 'Unknown'
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// CREATE Announcement
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, target } = req.body;
    const authorId = req.user?.id;

    if (!authorId) return res.status(401).json({ message: "Unauthorized" });

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        target,
        authorId
      }
    });
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// DELETE Announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};