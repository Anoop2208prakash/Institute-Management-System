// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';

interface ProcessedItem {
  itemId: string;
  quantity: number;
  price: number;
  name: string;
}

// 1. GET All Orders (Admin View)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { item: true } }, 
      },
      orderBy: { date: 'desc' }
    });
    
    const userIds = [...new Set(orders.map(o => o.orderBy))];
    
    // FIXED: Include 'avatar' to retrieve the full Cloudinary URL from MongoDB
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { studentProfile: true, teacherProfile: true, adminProfile: true }
    });

    const userMap = new Map(users.map(u => [u.id, {
        name: u.studentProfile?.fullName || u.teacherProfile?.fullName || u.adminProfile?.fullName || "Unknown",
        // Pass full Cloudinary URL directly
        avatar: u.avatar 
    }]));

    const formatted = orders.map(o => {
      const userInfo = userMap.get(o.orderBy);
      return {
        id: o.id,
        orderedBy: userInfo?.name || "Unknown User",
        // Delivering avatar for admin dashboard display
        avatar: userInfo?.avatar || null, 
        status: o.status,
        date: o.date,
        totalPrice: o.total,
        itemSummary: o.items.map(i => `${i.item.name} (x${i.quantity})`).join(', '),
        itemCount: o.items.length,
        items: o.items.map(i => ({
            name: i.item.name,
            category: i.item.category,
            qty: i.quantity,
            price: i.price
        }))
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// 2. GET My Orders (Student/Teacher Profile Sync)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // MongoDB ObjectId string
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { orderBy: userId },
      include: { 
          items: { include: { item: true } } 
      },
      orderBy: { date: 'desc' }
    });

    const formatted = orders.map(o => ({
        id: o.id,
        status: o.status,
        date: o.date,
        totalPrice: o.total,
        itemSummary: o.items.map(i => `${i.item.name} (x${i.quantity})`).join(', '),
        itemCount: o.items.length,
        items: o.items.map(i => ({
            name: i.item.name,
            category: i.item.category,
            qty: i.quantity,
            price: i.price
        }))
    }));

    res.json(formatted);
  } catch (e) {
    console.error("My Orders Error:", e);
    res.status(500).json({ error: 'Failed to fetch my orders' });
  }
};

// 3. UPDATE Order (Status sync with FeeRecords)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // MongoDB ObjectId
    const { status } = req.body; 

    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Automatically mark associated fee record as paid if delivered
    if (status === 'DELIVERED') {
        await prisma.feeRecord.updateMany({
            where: { orderId: id },
            data: { status: 'PAID', paidDate: new Date() }
        });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// 4. CREATE Order (Stock validation & Transactional processing)
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, cart } = req.body; // userId must be a valid MongoDB ObjectId
        
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let orderTotal = 0;
        const orderItemsData: ProcessedItem[] = [];

        // 1. Validate Stock in MongoDB Atlas
        for (const cartItem of cart) {
            const inventoryItem = await prisma.inventoryItem.findUnique({ 
                where: { id: cartItem.itemId } 
            });

            if (!inventoryItem || inventoryItem.quantity < cartItem.quantity) {
                return res.status(400).json({ message: `Insufficient stock for item: ${inventoryItem?.name || 'Unknown'}` });
            }

            orderTotal += inventoryItem.price * cartItem.quantity;
            orderItemsData.push({
                itemId: cartItem.itemId,
                quantity: Number(cartItem.quantity),
                price: inventoryItem.price,
                name: inventoryItem.name 
            });
        }

        // Execute bulk operations in a transaction
        await prisma.$transaction(async (tx) => {
            // 2. Create Order record
            const newOrder = await tx.order.create({
                data: {
                    orderBy: userId,
                    status: 'PENDING',
                    total: orderTotal,
                    items: {
                        create: orderItemsData.map(i => ({
                            itemId: i.itemId,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }
                }
            });

            // 3. Update stock levels
            for (const item of orderItemsData) {
                await tx.inventoryItem.update({
                    where: { id: item.itemId },
                    data: { quantity: { decrement: item.quantity } }
                });
            }

            // 4. Generate Invoice linked to the student
            const student = await tx.student.findUnique({ where: { userId } });
            if (student) {
                let title = `Store Purchase: ${orderItemsData.length} Items`;
                if (orderItemsData.length <= 2) {
                    title = `Purchase: ` + orderItemsData.map(i => `${i.name} (x${i.quantity})`).join(', ');
                }

                await tx.feeRecord.create({
                    data: {
                        studentId: student.id,
                        orderId: newOrder.id, 
                        title: title,
                        amount: orderTotal,
                        dueDate: new Date(),
                        status: 'PENDING'
                    }
                });
            }
        });

        res.status(201).json({ message: "Order placed successfully" });

    } catch (e) {
        console.error("Create Order Error:", e);
        res.status(500).json({ message: "Failed to place order" });
    }
};