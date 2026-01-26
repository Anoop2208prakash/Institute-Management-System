// server/src/controllers/markController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// 1. Get Exams assignable by this Teacher
export const getTeacherExams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // MongoDB ObjectId string
    
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const exams = await prisma.exam.findMany({
      where: {
        OR: [
          { subject: { teacherId: teacher.id } }, 
          { class: { teacherId: teacher.id } }    
        ]
      },
      include: {
        class: true,
        subject: true,
        semester: true
      },
      orderBy: { date: 'desc' }
    });

    const formatted = exams.map(e => ({
        id: e.id,
        name: e.name,
        className: e.class.name,
        subjectName: e.subject.name,
        date: e.date
    }));

    res.json(formatted);
  } catch (e) {
    console.error("Fetch Exams Error:", e);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// 2. Get Students & Marks for an Exam (UPDATED for Avatars)
export const getMarksSheet = async (req: AuthRequest, res: Response) => {
    try {
        const { examId } = req.params; // MongoDB ObjectId
        
        const exam = await prisma.exam.findUnique({ 
            where: { id: examId },
            include: { class: true } 
        });
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        // FIXED: Include 'user' to get the avatar URL from MongoDB
        const students = await prisma.student.findMany({
            where: { classId: exam.classId },
            include: { user: { select: { avatar: true } } }, 
            orderBy: { admissionNo: 'asc' }
        });

        const results = await prisma.result.findMany({
            where: { examId }
        });

        const sheet = students.map(s => {
            const result = results.find(r => r.studentId === s.id);
            return {
                studentId: s.id,
                name: s.fullName,
                admissionNo: s.admissionNo,
                // Delivering full Cloudinary URL directly
                avatar: s.user.avatar, 
                marksObtained: result ? result.marksObtained : '',
                totalMarks: result ? result.totalMarks : 100
            };
        });

        res.json({ 
            examTitle: `${exam.name} - ${exam.class.name}`, 
            students: sheet 
        });

    } catch (e) {
        console.error("Fetch Sheet Error:", e);
        res.status(500).json({ error: "Failed to load marks sheet" });
    }
};

// 3. Save Marks
interface MarkInput {
    studentId: string;
    marksObtained: number | string;
    totalMarks: number;
}

export const saveMarks = async (req: AuthRequest, res: Response) => {
    try {
        const { examId, marks } = req.body; 

        await prisma.$transaction(
            (marks as MarkInput[]).map((m) => 
                prisma.result.upsert({
                    where: {
                        // Composite unique key compatible with MongoDB
                        examId_studentId: {
                            examId,
                            studentId: m.studentId
                        }
                    },
                    update: { 
                        marksObtained: Number(m.marksObtained),
                        totalMarks: Number(m.totalMarks)
                    },
                    create: {
                        examId,
                        studentId: m.studentId,
                        marksObtained: Number(m.marksObtained),
                        totalMarks: Number(m.totalMarks)
                    }
                })
            )
        );

        res.json({ message: "Marks updated successfully" });
    } catch (e) {
        console.error("Save Marks Error:", e);
        res.status(500).json({ error: "Failed to save marks" });
    }
};