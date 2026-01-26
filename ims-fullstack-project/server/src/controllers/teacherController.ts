// server/src/controllers/teacherController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// GET My Assigned Subjects (Teacher)
export const getMySubjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // MongoDB ObjectId string
    
    // Find teacher and their subjects
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { 
        subjects: { 
            include: { 
                class: { 
                    // FIXED: Including 'user' to fetch the student's 'avatar' field
                    include: { students: { include: { user: { select: { avatar: true } } } } } 
                } 
            } 
        } 
      }
    });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Map specific subjects
    const formatted = teacher.subjects.map(s => ({
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        classId: s.class.id,
        className: s.class.name,
        classDescription: s.class.description,
        students: s.class.students.map((stu: any) => ({
            id: stu.id,
            name: stu.fullName,
            admissionNo: stu.admissionNo,
            // FIXED: Delivering the full Cloudinary URL directly to the teacher's view
            avatar: stu.user.avatar, 
            phone: stu.phone
        }))
    }));

    res.json(formatted);

  } catch (e) {
    console.error("Get My Subjects Error:", e);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

// MARK ATTENDANCE (Stub)
export const markAttendance = async (req: AuthRequest, res: Response) => {
    res.json({ message: "Attendance marked successfully" });
};

// ENTER MARKS (Stub)
export const enterMarks = async (req: AuthRequest, res: Response) => {
    res.json({ message: "Marks updated successfully" });
};