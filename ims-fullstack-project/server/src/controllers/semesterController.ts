// server/src/controllers/semesterController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Semesters
export const getSemesters = async (req: Request, res: Response) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { startDate: 'desc' } // Newest first
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
};

// CREATE Semester
export const createSemester = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, status } = req.body;

    const newSemester = await prisma.semester.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'UPCOMING'
      }
    });
    res.status(201).json(newSemester);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create semester' });
  }
};

// DELETE Semester
export const deleteSemester = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete semester' });
  }
};