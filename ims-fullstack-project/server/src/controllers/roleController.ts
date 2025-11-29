// server/src/controllers/roleController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getRoles = async (req: Request, res: Response) => {
  try {
    // Fetch all roles from the database
    const roles = await prisma.role.findMany({
      orderBy: { displayName: 'asc' }, // Sort A-Z
    });
    
    // Send them back as JSON
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};