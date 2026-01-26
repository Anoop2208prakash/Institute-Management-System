// server/src/controllers/attendanceController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// Define Interface for Attendance Record
interface AttendanceRecord {
    studentId: string; // MongoDB ObjectId string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

// 1. Get Teacher's Classes & Subjects
export const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // MongoDB ObjectId
    const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: { 
            classes: true, 
            subjects: { include: { class: true } } 
        }
    });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const subjectClasses = teacher.subjects.map(s => s.class);
    const allClasses = [...teacher.classes, ...subjectClasses]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); 

    res.json({ classes: allClasses, subjects: teacher.subjects });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

// 2. Get Students & Existing Attendance (UPDATED for Cloudinary)
export const getAttendanceSheet = async (req: AuthRequest, res: Response) => {
    try {
        const { classId, subjectId, date } = req.query;
        
        if(!classId || !date) return res.status(400).json({message: "Class and Date required"});

        // Include 'user' to fetch the 'avatar' field
        const students = await prisma.student.findMany({
            where: { classId: String(classId) }, // classId is a MongoDB ObjectId
            include: { user: true }, 
            orderBy: { admissionNo: 'asc' }
        });

        const startOfDay = new Date(String(date));
        startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(String(date));
        endOfDay.setHours(23,59,59,999);

        const existingRecords = await prisma.attendance.findMany({
            where: {
                classId: String(classId),
                subjectId: subjectId ? String(subjectId) : null,
                date: { gte: startOfDay, lte: endOfDay }
            }
        });

        const sheet = students.map(s => {
            const record = existingRecords.find(r => r.studentId === s.id);
            return {
                studentId: s.id,
                name: s.fullName,
                rollNo: s.admissionNo,
                // FIXED: Delivering full Cloudinary URL directly from MongoDB
                avatar: s.user.avatar, 
                status: record ? record.status : 'PRESENT' 
            };
        });

        res.json(sheet);

    } catch (e) {
        console.error("Attendance Sheet Error:", e);
        res.status(500).json({ error: "Failed to load attendance sheet" });
    }
};

// 3. Save Attendance
export const saveAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { classId, subjectId, date, records } = req.body; 

        const teacher = await prisma.teacher.findUnique({ where: { userId } });
        if (!teacher) return res.status(401).json({ message: "Unauthorized" });

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0,0,0,0); 

        const dbSubjectId = subjectId && subjectId !== "" ? subjectId : null;

        // MongoDB Atlas Transaction Logic
        await prisma.$transaction(
            (records as AttendanceRecord[]).map((rec) => {
                return prisma.attendance.upsert({
                    where: {
                        // Composite unique key for MongoDB
                        date_studentId_subjectId: {
                            date: attendanceDate,
                            studentId: rec.studentId,
                            subjectId: dbSubjectId
                        }
                    },
                    update: { 
                        status: rec.status, 
                        markedBy: teacher.id
                    },
                    create: {
                        date: attendanceDate,
                        status: rec.status,
                        studentId: rec.studentId,
                        classId: String(classId),
                        subjectId: dbSubjectId,
                        markedBy: teacher.id
                    }
                });
            })
        );

        res.json({ message: "Attendance saved successfully" });

    } catch (e) {
        console.error("Save Attendance Error:", e);
        res.status(500).json({ error: "Failed to save attendance" });
    }
};