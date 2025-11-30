// server/src/controllers/inventoryController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Items
export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// CREATE Item
export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, category, quantity, price } = req.body;

    // Enforce Category Restriction
    if (!['Uniform', 'Stationery'].includes(category)) {
        res.status(400).json({ message: "Category must be 'Uniform' or 'Stationery'" });
        return;
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        quantity: Number(quantity),
        price: Number(price)
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
};

// DELETE Item
export const deleteItem = async (req: Request, res: Response) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};