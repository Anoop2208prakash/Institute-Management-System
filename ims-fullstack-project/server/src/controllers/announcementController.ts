// server/src/controllers/announcementController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// 1. GET ALL (Include Author ID for frontend checks)
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: { 
        author: { 
          include: { adminProfile: true, teacherProfile: true, studentProfile: true } 
        } 
      },
      orderBy: { date: 'desc' }
    });

    const formatted = announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        target: a.target,
        date: a.date,
        authorId: a.authorId, // <--- CRITICAL: Needed for permission check
        authorName: a.author.adminProfile?.fullName || a.author.teacherProfile?.fullName || a.author.studentProfile?.fullName || 'Unknown',
        authorAvatar: a.author.avatar 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// 2. CREATE Announcement
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content, target } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user || user.role.name === 'student') {
        return res.status(403).json({ message: "Students cannot post announcements." });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        target,
        authorId: userId
      }
    });
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// 3. DELETE Announcement
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // PERMISSION CHECK:
    // 1. Super Admin can delete ANYTHING.
    // 2. Author can delete THEIR OWN post.
    if (user.role.name === 'super_admin' || announcement.authorId === userId) {
        await prisma.announcement.delete({ where: { id } });
        res.json({ message: 'Announcement deleted' });
    } else {
        return res.status(403).json({ message: "You can only delete your own announcements." });
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};