// server/src/controllers/classController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Classes
export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } }, // Count students
        // FIXED: Include 'user' to fetch the 'avatar' from MongoDB
        teacher: {
          include: {
            user: {
              select: {
                avatar: true // The full Cloudinary URL
              }
            }
          }
        }
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

    // 2. Check duplicate by Name (name is @unique in schema.prisma)
    const existing = await prisma.class.findUnique({
        where: { name }
    });

    if (existing) {
        res.status(400).json({ message: "A Program with this name already exists" });
        return;
    }

    // 3. Create (MongoDB generates the ObjectId automatically)
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
    const { id } = req.params; // MongoDB ObjectId string
    const { name, description, teacherId } = req.body; 

    let finalTeacherProfileId = undefined;

    // If a teacher is being assigned
    if (teacherId) {
        // Find teacher profile using the User's ObjectId
        const teacherProfile = await prisma.teacher.findUnique({
            where: { userId: teacherId }
        });
        
        if (teacherProfile) {
            finalTeacherProfileId = teacherProfile.id;
        }
    } else if (teacherId === null) {
        finalTeacherProfileId = null; // Explicit unassign
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
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
    const { id } = req.params; // MongoDB ObjectId
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    console.error("Delete Class Error:", error);
    res.status(500).json({ error: 'Failed to delete class. It might contain students or subjects.' });
  }
};