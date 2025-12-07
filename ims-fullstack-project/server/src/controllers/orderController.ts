// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

// 1. GET All Orders (Admin View)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        item: true, 
      },
      orderBy: { date: 'desc' }
    });
    
    // Fetch user details
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

// 2. GET My Orders (Student/Teacher View)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { orderBy: userId },
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

// 3. UPDATE Order Status (Admin Action) - WITH INVOICE UPDATE
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Order ID
    const { status } = req.body; // PENDING, APPROVED, DELIVERED

    console.log(`📦 Updating Order ${id} to ${status}`);

    // A. Update the Order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // B. If DELIVERED, automatically mark the linked Invoice as PAID
    if (status === 'DELIVERED') {
        const updateResult = await prisma.feeRecord.updateMany({
            where: { orderId: id }, // Find invoice linked to this order
            data: { 
                status: 'PAID',
                paidDate: new Date()
            }
        });
        console.log(`💰 Updated Invoice Status: ${updateResult.count} record(s) updated.`);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// 4. CREATE Order (With Invoice Link)
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { itemId, quantity, userId } = req.body;
        
        // Check stock
        const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
        if (!item || item.quantity < quantity) {
            res.status(400).json({ message: "Insufficient stock" });
            return;
        }

        const totalPrice = item.price * Number(quantity);

        await prisma.$transaction(async (tx) => {
            // A. Create Order
            const newOrder = await tx.order.create({
                data: {
                    itemId,
                    quantity: Number(quantity),
                    orderBy: userId,
                    status: 'PENDING'
                }
            });
            
            // B. Deduct Stock
            await tx.inventoryItem.update({
                where: { id: itemId },
                data: { quantity: { decrement: Number(quantity) } }
            });

            // C. Generate Linked Invoice
            const student = await tx.student.findUnique({ where: { userId } });
            
            if (student) {
                await tx.feeRecord.create({
                    data: {
                        studentId: student.id,
                        orderId: newOrder.id, // <--- Link this invoice to the order!
                        title: `Store Purchase: ${item.name} (x${quantity})`,
                        amount: totalPrice,
                        dueDate: new Date(),
                        status: 'PENDING'
                    }
                });
            }
        });

        res.status(201).json({ message: "Order placed and invoice generated" });
    } catch (e) {
        console.error("Create Order Error:", e);
        res.status(500).json({ message: "Failed to place order" });
    }
};