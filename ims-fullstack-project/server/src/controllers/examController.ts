// server/src/controllers/examController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET Exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        class: true,
        subject: {
          include: {
            teacher: {
              include: {
                user: { select: { avatar: true } } // FIXED: Include Cloudinary avatar for the subject teacher
              }
            }
          }
        },
        semester: true
      },
      orderBy: { date: 'asc' }
    });

    const formatted = exams.map(e => ({
      id: e.id, // MongoDB ObjectId string
      name: e.name,
      date: e.date,
      className: e.class.name, // Removed .section as it's not in your new MongoDB schema
      subjectName: `${e.subject.name} (${e.subject.code})`,
      teacherAvatar: e.subject.teacher?.user.avatar || null, // Full Cloudinary URL
      semesterName: e.semester.name,
      status: e.semester.status 
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch Exams Error:", error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// CREATE Exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const { name, date, classId, subjectId, semesterId } = req.body;

    // MongoDB Atlas requires valid ObjectId strings for these relationships
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
    console.error("Create Exam Error:", error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

// DELETE Exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    // ID here must be a valid MongoDB ObjectId
    await prisma.exam.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    console.error("Delete Exam Error:", error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};