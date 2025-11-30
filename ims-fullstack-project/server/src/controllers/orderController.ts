// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// GET All Orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        item: true, // Get item details (Name, Price)
        // We need to fetch the user details manually or via relation if setup
        // Since 'orderBy' is just a String ID in your schema, we might need to fetch user separately
        // OR, ideally, update schema to relation. For now, we will just show the ID or fetch basic info.
      },
      orderBy: { date: 'desc' }
    });
    
    // To get User names, we can do a second query or update schema.
    // For high performance, let's fetch users based on IDs found in orders.
    const userIds = [...new Set(orders.map(o => o.orderBy))];
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { studentProfile: true, teacherProfile: true, adminProfile: true }
    });

    const userMap = new Map(users.map(u => [u.id, 
        u.studentProfile?.fullName || u.teacherProfile?.fullName || u.adminProfile?.fullName || "Unknown"
    ]));

    const formatted = orders.map(o => ({
      id: o.id,
      itemName: o.item.name,
      category: o.item.category,
      quantity: o.quantity,
      totalPrice: o.quantity * o.item.price,
      orderedBy: userMap.get(o.orderBy) || "Unknown User",
      status: o.status,
      date: o.date
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// UPDATE Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, APPROVED, DELIVERED

    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    // Optional: If status is REJECTED, maybe re-add stock to inventory?
    // For now, simple status update.

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// CREATE Order (For testing purposes by Admin)
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { itemId, quantity, userId } = req.body;
        
        // Check stock
        const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
        if (!item || item.quantity < quantity) {
            res.status(400).json({ message: "Insufficient stock" });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Create Order
            await tx.order.create({
                data: {
                    itemId,
                    quantity: Number(quantity),
                    orderBy: userId,
                    status: 'PENDING'
                }
            });
            
            // Deduct Stock
            await tx.inventoryItem.update({
                where: { id: itemId },
                data: { quantity: { decrement: Number(quantity) } }
            });
        });

        res.status(201).json({ message: "Order placed" });
    } catch (e) {
        res.status(500).json({ message: "Failed to place order" });
    }
};