// server/src/controllers/studentController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

// ------------------------------------------
// 1. REGISTER STUDENT
// ------------------------------------------
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      fullName, email, password, phone, dob, 
      gender, address, bloodGroup, admissionNo, classId 
    } = req.body;
    
    // Get profile image path
    const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    // Basic Validation
    if (!email || !password || !fullName || !admissionNo) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check duplicates
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get Student Role ID
    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
    if (!studentRole) {
        res.status(500).json({ message: "System Error: Student role not defined" });
        return;
    }

    // Transaction: Create User + Student Profile
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Create User Login
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: studentRole.id,
          avatar: profileImage, // Saved in User table
          isActive: true,
        },
      });

      // 2. Handle Class Assignment
      let finalClassId = classId;
      
      // Fallback: If no class selected, find or create a default one (Safety net)
      if (!finalClassId) {
        let defaultClass = await tx.class.findFirst();
        if (!defaultClass) {
            defaultClass = await tx.class.create({ data: { name: 'Grade 1', section: 'A' } });
        }
        finalClassId = defaultClass.id;
      }

      // 3. Create Student Profile
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
// 2. GET ALL STUDENTS
// ------------------------------------------
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,   // To get Avatar and Email
        class: true,  // To get Class Name
      },
      orderBy: { admissionNo: 'asc' }
    });

    const formatted = students.map(s => ({
      id: s.userId, // Use User ID for actions (delete/edit)
      admissionNo: s.admissionNo,
      name: s.fullName,
      email: s.user.email,
      class: s.class ? `${s.class.name} (${s.class.section})` : 'Unassigned',
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
// 3. DELETE STUDENT
// ------------------------------------------
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // This is the User ID

    // Prisma Cascade Delete: Deleting User removes Student Profile automatically
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};