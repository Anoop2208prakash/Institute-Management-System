// server/src/controllers/classController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } } // Count students in each class
      },
      orderBy: { name: 'asc' }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// CREATE Class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, section } = req.body;
    
    // Check duplicate
    const existing = await prisma.class.findFirst({
        where: { name, section }
    });

    if (existing) {
        res.status(400).json({ message: "Class with this section already exists" });
        return;
    }

    const newClass = await prisma.class.create({
      data: { name, section }
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
};

// DELETE Class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class. It might contain students.' });
  }
};