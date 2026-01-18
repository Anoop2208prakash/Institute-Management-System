// server/src/controllers/studentController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// ------------------------------------------
// 1. REGISTER STUDENT (Admin/Super Admin only)
// ------------------------------------------
export const registerStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      fullName, email, password, phone, dob, 
      gender, address, bloodGroup, admissionNo, classId,
      needsHostel 
    } = req.body;

    // --- ROLE AUTHORIZATION CHECK ---
    const userRole = req.user?.role?.toUpperCase().replace(/_/g, ' ');
    
    if (userRole !== 'SUPER ADMIN' && userRole !== 'ADMINISTRATOR') {
      res.status(403).json({ message: "Access Denied: Only Super Admins or Administrators can admit students" });
      return;
    }
    
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

    const hostelRequired = needsHostel === 'true' || needsHostel === true;

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
      if (!finalClassId) {
        let defaultClass = await tx.class.findFirst();
        if (!defaultClass) {
            defaultClass = await tx.class.create({ data: { name: 'Grade 1' } });
        }
        finalClassId = defaultClass.id;
      }

      const birthDate = dob ? new Date(dob) : new Date();

      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          fullName,
          admissionNo,
          dob: birthDate,
          gender: gender || 'MALE',
          address,
          phone,
          bloodGroup,
          classId: finalClassId,
          needsHostel: hostelRequired 
        },
      });

      // --- LOG ACTIVITY ---
      await tx.activity.create({
        data: {
          action: "CREATE",
          message: `Admitted student: ${fullName} (${admissionNo})`
        }
      });

      return newStudent;
    });

    res.status(201).json({ message: "Student admitted successfully", studentId: result.userId });

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
        user: {
          select: { email: true, avatar: true, isActive: true }
        },
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
      classId: s.classId,
      phone: s.phone,
      avatar: s.user.avatar,
      gender: s.gender,
      needsHostel: s.needsHostel
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// ------------------------------------------
// 3. UPDATE STUDENT (Admin)
// ------------------------------------------
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { name, phone, gender, classId, needsHostel } = req.body;

    await prisma.student.update({
      where: { userId: id },
      data: {
        fullName: name,
        phone: phone,
        gender: gender,
        classId: classId,
        needsHostel: needsHostel === 'true' || needsHostel === true 
      }
    });

    res.json({ message: "Student record updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

// ------------------------------------------
// 4. DELETE STUDENT (Admin)
// ------------------------------------------
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction(async (tx) => {
        const student = await tx.student.findUnique({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
        
        await tx.activity.create({
            data: {
                action: "DELETE",
                message: `Removed student record for: ${student?.fullName || id}`
            }
        });
    });

    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

// ==========================================
// STUDENT PORTAL API (Self-Service)
// ==========================================

export const getMySubjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const subjects = await prisma.subject.findMany({
      where: { classId: student.classId },
      include: { teacher: true, semester: true }
    });

    res.json(subjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        teacher: s.teacher?.fullName || 'TBA',
        semester: s.semester?.name || 'General'
    })));
  } catch (e) { 
    console.error(e);
    res.status(500).json({ error: "Failed to fetch subjects" }); 
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { subjectId } = req.query;

        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        const whereClause: any = { studentId: student.id };
        if (subjectId) whereClause.subjectId = String(subjectId);

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: { subject: true } 
        });

        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;

        res.json({ 
          stats: { total, present, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0 }, 
          history: attendance 
        });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: "Failed to fetch attendance" }); 
    }
};

export const getMyResults = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        const results = await prisma.result.findMany({
            where: { studentId: student.id },
            include: { exam: { include: { subject: true, semester: true } } },
            orderBy: { exam: { date: 'desc' } }
        });
        
        res.json(results.map(r => ({
            id: r.id,
            examName: r.exam?.name || "Exam",
            subject: r.exam?.subject?.name || "N/A",
            semester: r.exam?.semester?.name || "N/A",
            date: r.exam?.date,
            marks: r.marksObtained,
            total: r.totalMarks,
            grade: (r.marksObtained / r.totalMarks) * 100 >= 40 ? 'PASS' : 'FAIL'
        })));
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: "Failed to fetch results" }); 
    }
};

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
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: "Failed to fetch fees" }); 
    }
};

export const getAdmitCard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ 
            where: { userId },
            include: { class: true, user: true }
        });
        
        if (!student) return res.status(404).json({ message: "Student not found" });

        const exams = await prisma.exam.findMany({
            where: { 
                classId: student.classId, 
                date: { gte: new Date() } 
            },
            include: { subject: true, semester: true },
            orderBy: { date: 'asc' }
        });

        res.json({
            student: {
                name: student.fullName,
                admissionNo: student.admissionNo,
                class: student.class?.name || "Unassigned",
                section: student.class?.description || "N/A",
                avatar: student.user?.avatar || null
            },
            exams: exams.map(e => ({
                id: e.id,
                subject: e.subject?.name || "Unknown",
                code: e.subject?.code || "N/A",
                date: e.date,
                semester: e.semester?.name || "N/A",
                examName: e.name
            }))
        });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: "Failed to fetch admit card data" }); 
    }
};