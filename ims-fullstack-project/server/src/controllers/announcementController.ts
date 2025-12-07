// server/src/controllers/announcementController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// GET All Announcements
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
        authorName: a.author.adminProfile?.fullName || a.author.teacherProfile?.fullName || a.author.studentProfile?.fullName || 'Unknown',
        authorAvatar: a.author.avatar 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// CREATE Announcement (Restricted)
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content, target } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Check User Role
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    // 2. Deny if Student
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
    console.error(error);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// DELETE Announcement (Restricted)
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Check permission
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || user.role.name === 'student') {
        return res.status(403).json({ message: "Permission denied" });
    }

    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};