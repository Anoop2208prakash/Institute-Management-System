// server/src/controllers/teacherController.ts
import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// GET My Assigned Class & Students
export const getMyClass = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // 1. Find the teacher profile linked to this user
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { 
        classes: { 
          include: { 
            students: { 
              include: { user: true } 
            } 
          } 
        } 
      }
    });

    if (!teacher) {
       return res.status(404).json({ message: "Teacher profile not found." });
    }

    // 2. Check if any class is assigned
    if (!teacher.classes || teacher.classes.length === 0) {
        return res.status(200).json(null); // Return null to indicate "No Class Assigned" cleanly
    }

    // 3. Get the first class
    const myClass = teacher.classes[0];

    const formatted = {
        className: myClass.name,
        // FIX: Changed from 'section' (which was removed) to 'description'
        description: myClass.description || '', 
        students: myClass.students.map(s => ({
            id: s.id,
            name: s.fullName,
            admissionNo: s.admissionNo,
            avatar: s.user.avatar,
            phone: s.phone
        }))
    };

    res.json(formatted);

  } catch (e) {
    console.error("Get My Class Error:", e);
    res.status(500).json({ error: "Failed to fetch class" });
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