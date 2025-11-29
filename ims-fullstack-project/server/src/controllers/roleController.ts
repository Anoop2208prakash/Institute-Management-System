// server/src/controllers/roleController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { displayName: 'asc' } });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// CREATE New Role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, displayName, description } = req.body;
    
    // Auto-generate 'name' slug if not provided (e.g. "Vice Principal" -> "vice_principal")
    const systemName = name || displayName.toLowerCase().replace(/\s+/g, '_');

    const newRole = await prisma.role.create({
      data: { name: systemName, displayName, description }
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// DELETE Role
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role (It might be in use)' });
  }
};