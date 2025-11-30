// server/src/controllers/studentController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

// 1. Register Student (New Admission)
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      fullName, email, password, phone, dob, 
      gender, address, bloodGroup, admissionNo 
    } = req.body;
    
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

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: studentRole.id,
          avatar: profileImage,
          isActive: true,
        },
      });

      // Create Student Profile
      // Note: We need a Class ID. For this demo, we will Create a dummy class if none exists
      // In production, you would select from a dropdown of existing classes
      let defaultClass = await tx.class.findFirst();
      if (!defaultClass) {
        defaultClass = await tx.class.create({ data: { name: 'Grade 1', section: 'A' } });
      }

      await tx.student.create({
        data: {
          userId: newUser.id,
          fullName,
          admissionNo,
          dob: new Date(dob),
          gender: gender || 'MALE', // Default fallback
          address,
          phone,
          bloodGroup,
          classId: defaultClass.id
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

// 2. Get All Students (View Admission)
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        class: true, // Include Class info
      },
      orderBy: { admissionNo: 'asc' }
    });

    const formatted = students.map(s => ({
      id: s.userId, // Use User ID for actions
      admissionNo: s.admissionNo,
      name: s.fullName,
      email: s.user.email,
      class: `${s.class.name} - ${s.class.section}`,
      phone: s.phone,
      avatar: s.user.avatar,
      gender: s.gender
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};