// server/src/controllers/subjectController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Subjects
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        class: true, 
        teacher: true,
        semester: true // <--- Include Semester Info
      },
      orderBy: { name: 'asc' }
    });

    const formatted = subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      classId: s.classId,         // <--- CRITICAL: Needed for Frontend Filtering
      semesterId: s.semesterId,   // <--- CRITICAL: Needed for Frontend Filtering
      // Note: 'section' was removed from Class model, using name only. 
      className: s.class ? s.class.name : 'Unassigned',
      teacherName: s.teacher?.fullName || 'Unassigned',
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
    const { name, code, classId, teacherId, semesterId } = req.body; // <--- Get semesterId

    console.log("📝 Creating Subject:", { name, code, classId, teacherId, semesterId });

    // 1. Validation
    if (!name || !code || !classId) {
      res.status(400).json({ message: "Name, Code, and Class are required." });
      return;
    }

    let finalTeacherId = null;

    // 2. Resolve User ID to Teacher Profile ID
    if (teacherId) {
        const teacherProfile = await prisma.teacher.findUnique({
            where: { userId: teacherId }
        });

        if (teacherProfile) {
            finalTeacherId = teacherProfile.id;
        } else {
             // If invalid teacher ID sent, proceed without assigning
             console.warn("Invalid Teacher User ID provided, subject will be unassigned.");
        }
    }

    // 3. Create in DB
    const newSubject = await prisma.subject.create({
      data: {
        name,
        code,
        classId,
        teacherId: finalTeacherId,
        semesterId: semesterId || null // <--- Save Semester Link (or null)
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
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};