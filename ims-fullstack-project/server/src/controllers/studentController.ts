// server/src/controllers/studentController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// ------------------------------------------
// 1. REGISTER STUDENT (Admin)
// ------------------------------------------
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      fullName, email, password, phone, dob, 
      gender, address, bloodGroup, admissionNo, classId 
    } = req.body;
    
    const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (!email || !password || !fullName || !admissionNo) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
    if (!studentRole) {
        res.status(500).json({ message: "System Error: Student role not defined" });
        return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: studentRole.id,
          avatar: profileImage,
          isActive: true,
        },
      });

      let finalClassId = classId;
      
      // Fallback if no class is selected
      if (!finalClassId) {
        let defaultClass = await tx.class.findFirst();
        if (!defaultClass) {
            defaultClass = await tx.class.create({ data: { name: 'Grade 1' } });
        }
        finalClassId = defaultClass.id;
      }

      await tx.student.create({
        data: {
          userId: newUser.id,
          fullName,
          admissionNo,
          dob: new Date(dob),
          gender: gender || 'MALE',
          address,
          phone,
          bloodGroup,
          classId: finalClassId
        },
      });

      return newUser;
    });

    res.status(201).json({ message: "Student admitted successfully", studentId: result.id });

  } catch (error) {
    console.error("Admission Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------------------------------
// 2. GET ALL STUDENTS (Admin Directory)
// ------------------------------------------
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        class: true, 
      },
      orderBy: { admissionNo: 'asc' }
    });

    const formatted = students.map(s => ({
      id: s.userId,
      admissionNo: s.admissionNo,
      name: s.fullName,
      email: s.user.email,
      class: s.class ? s.class.name : 'Unassigned', 
      phone: s.phone,
      avatar: s.user.avatar,
      gender: s.gender
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// ------------------------------------------
// 3. DELETE STUDENT (Admin)
// ------------------------------------------
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

// ==========================================
// STUDENT PORTAL API (Self-Service)
// ==========================================

// 4. My Subjects
export const getMySubjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const subjects = await prisma.subject.findMany({
      where: { classId: student.classId },
      include: { teacher: true, semester: true }
    });

    const formatted = subjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        teacher: s.teacher?.fullName || 'TBA',
        semester: s.semester?.name || 'General'
    }));
    res.json(formatted);
  } catch (e) { res.status(500).json({ error: "Failed to fetch subjects" }); }
};

// 5. My Attendance (Updated with Filtering)
export const getMyAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        // Get query parameter 'subjectId'
        const { subjectId } = req.query;

        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        // Build filter: Always filter by studentId
        const whereClause: any = { studentId: student.id };
        
        // If subjectId is provided in query, add it to filter
        if (subjectId) {
            whereClause.subjectId = String(subjectId);
        }

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: { subject: true } 
        });

        // Calculate Stats based on the filtered results
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        res.json({ stats: { total, present, percentage }, history: attendance });
    } catch (e) { res.status(500).json({ error: "Failed to fetch attendance" }); }
};

// 6. My Results
export const getMyResults = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        const results = await prisma.result.findMany({
            where: { studentId: student.id },
            include: { 
                exam: { include: { subject: true, semester: true } } 
            },
            orderBy: { exam: { date: 'desc' } }
        });
        
        const formatted = results.map(r => ({
            id: r.id,
            examName: r.exam.name,
            subject: r.exam.subject.name,
            semester: r.exam.semester.name,
            date: r.exam.date,
            marks: r.marksObtained,
            total: r.totalMarks,
            grade: (r.marksObtained / r.totalMarks) * 100 >= 40 ? 'PASS' : 'FAIL'
        }));
        res.json(formatted);
    } catch (e) { res.status(500).json({ error: "Failed to fetch results" }); }
};

// 7. My Fee Invoices
export const getMyInvoices = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        const fees = await prisma.feeRecord.findMany({
            where: { studentId: student.id },
            orderBy: { dueDate: 'desc' }
        });
        res.json(fees);
    } catch (e) { res.status(500).json({ error: "Failed to fetch fees" }); }
};

// 8. Admit Card Generation
export const getAdmitCard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        const student = await prisma.student.findUnique({ 
            where: { userId },
            include: { 
                class: true,
                user: true // CRITICAL for Avatar
            }
        });
        
        if (!student) return res.status(404).json({ message: "Student not found" });

        const exams = await prisma.exam.findMany({
            where: { 
                classId: student.classId,
                date: { gte: new Date() } // Future exams
            },
            include: { subject: true, semester: true },
            orderBy: { date: 'asc' }
        });

        res.json({
            student: {
                name: student.fullName,
                admissionNo: student.admissionNo,
                class: student.class.name,
                section: student.class.description,
                avatar: student.user.avatar 
            },
            exams: exams.map(e => ({
                id: e.id,
                subject: e.subject.name,
                code: e.subject.code,
                date: e.date,
                semester: e.semester.name,
                examName: e.name
            }))
        });

    } catch (e) { res.status(500).json({ error: "Failed to fetch admit card data" }); }
};