// server/src/controllers/onlineExamController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// GET Teacher's Tests
export const getTeacherTests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const tests = await prisma.onlineExam.findMany({
      where: { teacherId: teacher.id },
      include: { 
        class: true, 
        subject: true,
        _count: { select: { questions: true, submissions: true } }
      },
      orderBy: { date: 'desc' }
    });

    const formatted = tests.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      date: t.date,
      duration: t.duration,
      className: t.class.name,
      subjectName: t.subject.name,
      questionCount: t._count.questions,
      submissionCount: t._count.submissions
    }));

    res.json(formatted);
  } catch (e) {
    console.error("Get Tests Error:", e);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

// CREATE Test
export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, date, duration, classId, subjectId } = req.body;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(403).json({ message: "Teacher profile not found" });

    const newTest = await prisma.onlineExam.create({
      data: {
        title, 
        description, 
        date: new Date(date), 
        duration: Number(duration),
        classId, 
        subjectId,
        teacherId: teacher.id
      }
    });
    res.status(201).json(newTest);
  } catch (e) {
    console.error("Create Test Error:", e);
    res.status(500).json({ error: "Failed to create test" });
  }
};

// ADD Single Question
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { examId, questionText, options, correctOption, marks } = req.body;

    // Ensure options are stored as a string (if sent as array from frontend)
    const optionsString = typeof options === 'string' ? options : JSON.stringify(options);

    await prisma.question.create({
      data: {
        examId,
        questionText,
        options: optionsString,
        correctOption: Number(correctOption),
        marks: Number(marks)
      }
    });
    res.json({ message: "Question added" });
  } catch (e) {
    console.error("Add Question Error:", e);
    res.status(500).json({ error: "Failed to add question" });
  }
};

// NEW: ADD Bulk Questions
export const addBulkQuestions = async (req: Request, res: Response) => {
  try {
    const { examId, questions } = req.body; // Expecting an array of questions

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "No questions provided" });
    }

    // Format data for Prisma
    const formattedData = questions.map((q: any) => ({
        examId,
        questionText: q.questionText,
        options: JSON.stringify(q.options), // Convert array to string
        correctOption: Number(q.correctOption),
        marks: Number(q.marks)
    }));

    // Bulk Insert
    await prisma.question.createMany({
        data: formattedData
    });

    res.json({ message: `${questions.length} questions added successfully` });
  } catch (e) {
    console.error("Bulk Add Error:", e);
    res.status(500).json({ error: "Failed to add questions" });
  }
};

// DELETE Test
export const deleteTest = async (req: Request, res: Response) => {
  try {
    await prisma.onlineExam.delete({ where: { id: req.params.id } });
    res.json({ message: 'Test deleted' });
  } catch (e) {
    console.error("Delete Test Error:", e);
    res.status(500).json({ error: "Failed to delete test" });
  }
};