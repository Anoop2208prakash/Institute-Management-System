// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth'; // Import AuthRequest

// 1. GET All Orders (Admin View)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        item: true, 
      },
      orderBy: { date: 'desc' }
    });
    
    // Fetch user details manually since 'orderBy' is just an ID string
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

// 2. GET My Orders (Student/Teacher View) -- NEW FUNCTION
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { orderBy: userId }, // Filter by logged-in user
      include: { item: true },
      orderBy: { date: 'desc' }
    });

    const formatted = orders.map(o => ({
        id: o.id,
        itemName: o.item.name,
        category: o.item.category,
        quantity: o.quantity,
        totalPrice: o.quantity * o.item.price,
        status: o.status,
        date: o.date
    }));

    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch my orders' });
  }
};

// 3. UPDATE Order Status (Admin Action)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, APPROVED, DELIVERED

    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// 4. CREATE Order (User Action)
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