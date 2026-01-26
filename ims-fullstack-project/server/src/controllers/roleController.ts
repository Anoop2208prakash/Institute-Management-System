// server/src/controllers/roleController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    // Fetches roles from MongoDB Atlas sorted alphabetically
    const roles = await prisma.role.findMany({ orderBy: { displayName: 'asc' } });
    res.json(roles);
  } catch (error) {
    console.error("Fetch Roles Error:", error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// CREATE New Role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, displayName, description } = req.body;
    
    // Auto-generate 'name' slug if not provided (e.g. "Vice Principal" -> "vice_principal")
    // This system name is used for authorization checks in auth.ts
    const systemName = name || displayName.toLowerCase().replace(/\s+/g, '_');

    const newRole = await prisma.role.create({
      data: { 
        name: systemName, 
        displayName, 
        description 
      }
    });
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// DELETE Role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // String representing a MongoDB ObjectId
    
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error("Delete Role Error:", error);
    // Typical failure reason: Role is still assigned to users in the 'users' collection
    res.status(500).json({ error: 'Failed to delete role (It might be in use by active users)' });
  }
};