// server/src/controllers/subjectController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Subjects
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        class: true, 
        // FIXED: Include 'user' to fetch the 'avatar' URL from MongoDB
        teacher: {
          include: {
            user: {
              select: { avatar: true }
            }
          }
        },
        semester: true 
      },
      orderBy: { name: 'asc' }
    });

    const formatted = subjects.map(s => ({
      id: s.id, // MongoDB ObjectId string
      name: s.name,
      code: s.code,
      classId: s.classId,
      semesterId: s.semesterId,
      className: s.class ? s.class.name : 'Unassigned',
      teacherName: s.teacher?.fullName || 'Unassigned',
      // FIXED: Delivering full Cloudinary URL directly to the frontend
      teacherAvatar: s.teacher?.user?.avatar || null,
      semesterName: s.semester?.name || 'General / All Semesters' 
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Error:", error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// CREATE Subject
export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, classId, teacherId, semesterId } = req.body; 

    console.log("📝 Creating Subject:", { name, code, classId, teacherId, semesterId });

    if (!name || !code || !classId) {
      res.status(400).json({ message: "Name, Code, and Class are required." });
      return;
    }

    let finalTeacherId = null;

    if (teacherId) {
        // Resolve using the User's ObjectId string
        const teacherProfile = await prisma.teacher.findUnique({
            where: { userId: teacherId }
        });

        if (teacherProfile) {
            finalTeacherId = teacherProfile.id;
        } else {
             console.warn("Invalid Teacher User ID provided, subject will be unassigned.");
        }
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        classId, // MongoDB ObjectId
        teacherId: finalTeacherId,
        semesterId: semesterId || null 
      }
    });
    
    res.status(201).json(newSubject);

  } catch (error) {
    console.error("❌ Create Subject Error:", error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// DELETE Subject
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    // req.params.id is treated as a string matching a MongoDB ObjectId
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};