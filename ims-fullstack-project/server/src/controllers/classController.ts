// server/src/controllers/classController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } }, // Count students
        teacher: true // Include assigned teacher details
      },
      orderBy: { name: 'asc' }
    });
    res.json(classes);
  } catch (error) {
    console.error("Get Classes Error:", error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// CREATE Class (Program)
export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    // 1. Validation
    if (!name) {
        res.status(400).json({ message: "Program Name is required" });
        return;
    }

    // 2. Check duplicate by Name
    const existing = await prisma.class.findUnique({
        where: { name }
    });

    if (existing) {
        res.status(400).json({ message: "A Program with this name already exists" });
        return;
    }

    // 3. Create
    const newClass = await prisma.class.create({
      data: { 
        name, 
        description 
      }
    });
    res.status(201).json(newClass);

  } catch (error) {
    console.error("Create Class Error:", error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

// UPDATE Class (Edit or Assign Teacher)
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, teacherId } = req.body; 
    // Note: teacherId from frontend is usually the UserID, we need the TeacherProfileID

    let finalTeacherProfileId = undefined;

    // If a teacher is being assigned
    if (teacherId) {
        const teacherProfile = await prisma.teacher.findUnique({
            where: { userId: teacherId }
        });
        
        if (teacherProfile) {
            finalTeacherProfileId = teacherProfile.id;
        } else {
             // If passing raw Profile ID directly (rare but possible depending on frontend logic)
             // You could add a check here, but usually userId lookup is safer
        }
    } else if (teacherId === null) {
        finalTeacherProfileId = null; // Explicit unassign
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        // Only update fields if they are present in the request
        ...(name && { name }),
        ...(description !== undefined && { description }), // Allow empty string
        ...(finalTeacherProfileId !== undefined && { teacherId: finalTeacherProfileId })
      }
    });

    res.json(updatedClass);
  } catch (error) {
    console.error("Update Class Error:", error);
    res.status(500).json({ error: 'Failed to update class' });
  }
};

// DELETE Class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    console.error("Delete Class Error:", error);
    // Prisma error P2003 means foreign key constraint failed (e.g. class has students)
    res.status(500).json({ error: 'Failed to delete class. It might contain students or subjects.' });
  }
};