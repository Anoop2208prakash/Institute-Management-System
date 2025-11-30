// server/src/controllers/examController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET Exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        class: true,
        subject: true,
        semester: true
      },
      orderBy: { date: 'asc' }
    });

    const formatted = exams.map(e => ({
      id: e.id,
      name: e.name,
      date: e.date,
      className: `${e.class.name} (${e.class.section})`,
      subjectName: `${e.subject.name} (${e.subject.code})`,
      semesterName: e.semester.name,
      status: e.semester.status // Helper to see if exam is in active semester
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// CREATE Exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const { name, date, classId, subjectId, semesterId } = req.body;

    const newExam = await prisma.exam.create({
      data: {
        name,
        date: new Date(date),
        classId,
        subjectId,
        semesterId
      }
    });
    res.status(201).json(newExam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

// DELETE Exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    await prisma.exam.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};