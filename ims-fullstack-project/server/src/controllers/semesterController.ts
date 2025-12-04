// server/src/controllers/semesterController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Semesters
export const getSemesters = async (req: Request, res: Response) => {
  try {
    const semesters = await prisma.semester.findMany({
      include: { class: true },
      orderBy: { createdAt: 'desc' } 
    });
    
    const formatted = semesters.map(s => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status,
        classId: s.classId, // <--- CRITICAL: Needed for Frontend Filtering
        programName: s.class?.name || "Unknown Program"
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get Semesters Error:", error);
    res.status(500).json({ error: 'Failed to fetch semesters' });
  }
};

// CREATE Semester
export const createSemester = async (req: Request, res: Response) => {
  try {
    const { name, classId } = req.body;

    if (!classId || !name) {
        res.status(400).json({ message: "Semester Name and Program are required" });
        return;
    }

    const newSemester = await prisma.semester.create({
      data: {
        name,
        classId,
        // startDate and endDate are optional
        status: 'UPCOMING' // Default
      }
    });
    res.status(201).json(newSemester);
  } catch (error) {
    console.error("Create Semester Error:", error);
    res.status(500).json({ error: 'Failed to create semester' });
  }
};

// DELETE Semester
export const deleteSemester = async (req: Request, res: Response) => {
  try {
    await prisma.semester.delete({ where: { id: req.params.id } });
    res.json({ message: 'Semester deleted' });
  } catch (error) {
    console.error("Delete Semester Error:", error);
    res.status(500).json({ error: 'Failed to delete semester' });
  }
};