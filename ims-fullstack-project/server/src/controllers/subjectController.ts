// server/src/controllers/subjectController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Subjects (with Class info)
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        class: true, // Fetch the related class details
        teacher: true // Fetch the assigned teacher (if any)
      },
      orderBy: { name: 'asc' }
    });

    const formatted = subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      className: `${s.class.name} (${s.class.section})`,
      teacherName: s.teacher?.fullName || 'Unassigned'
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// CREATE Subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, classId, teacherId } = req.body;

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        teacherId: teacherId || null // Optional teacher assignment
      }
    });
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// DELETE Subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};