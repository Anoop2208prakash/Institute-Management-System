// server/src/controllers/hostelController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// --- 1. GET ALL HOSTELS (Analytics & Allocation Data) ---
export const getHostelStats = async (req: Request, res: Response) => {
    try {
        const hostels = await prisma.hostel.findMany({
            include: {
                _count: { select: { rooms: true } },
                rooms: {
                    include: {
                        _count: { 
                            select: { allocations: { where: { status: 'OCCUPIED' } } } 
                        }
                    }
                }
            }
        });

        const formatted = hostels.map(h => {
            const totalCapacity = h.rooms.reduce((acc, r) => acc + r.capacity, 0);
            const occupied = h.rooms.reduce((acc, r) => acc + r._count.allocations, 0);

            return {
                id: h.id,
                name: h.name,
                type: h.type,
                roomCount: h._count.rooms,
                totalCapacity,
                occupied,
                available: totalCapacity - occupied,
                rooms: h.rooms.map(r => ({
                    id: r.id,
                    roomNumber: r.roomNumber,
                    capacity: r.capacity,
                    _count: r._count
                }))
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Fetch Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch hostel statistics" });
    }
};

// --- 2. GET AVAILABLE ROOMS (FOR WORKSPACE) ---
/**
 * @desc Fetches rooms that have at least one vacant bed.
 * Resolves the 404 error on the Room Allocation page.
 */
export const getAvailableRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                hostel: { select: { name: true } },
                _count: {
                    select: { allocations: { where: { status: 'OCCUPIED' } } }
                }
            }
        });

        // Filter rooms where occupied beds < total capacity
        const availableRooms = rooms
            .filter(room => room._count.allocations < room.capacity)
            .map(room => ({
                id: room.id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                capacity: room.capacity,
                occupiedCount: room._count.allocations,
                hostelName: room.hostel.name
            }));

        res.json(availableRooms);
    } catch (error) {
        console.error("Fetch Available Rooms Error:", error);
        res.status(500).json({ message: "Failed to fetch available rooms" });
    }
};

// --- 3. CREATE NEW HOSTEL BLOCK ---
export const createHostel = async (req: Request, res: Response) => {
    try {
        const { name, type, capacity } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: "Name and Type are required" });
        }

        const newHostel = await prisma.hostel.create({
            data: {
                name,
                type,
                capacity: parseInt(capacity) || 0
            }
        });

        res.status(201).json(newHostel);
    } catch (error) {
        console.error("Create Hostel Error:", error);
        res.status(500).json({ message: "Failed to create hostel block" });
    }
};

// --- 4. CREATE NEW ROOM & FLOOR ---
export const createRoom = async (req: Request, res: Response) => {
    try {
        const { roomNumber, floor, capacity, hostelId } = req.body;

        if (!roomNumber || floor === undefined || !capacity || !hostelId) {
            return res.status(400).json({ message: "Missing required room details" });
        }

        const existingRoom = await prisma.room.findFirst({
            where: { roomNumber, hostelId }
        });

        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists in this block" });
        }

        const newRoom = await prisma.room.create({
            data: {
                roomNumber,
                floor: parseInt(floor),
                capacity: parseInt(capacity),
                hostelId
            }
        });

        res.status(201).json({ 
            message: `Room ${roomNumber} created on floor ${floor}`, 
            room: newRoom 
        });
    } catch (error) {
        console.error("Create Room Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 5. GET PENDING ALLOCATIONS ---
export const getPendingAllocations = async (req: Request, res: Response) => {
    try {
        const pending = await prisma.student.findMany({
            where: {
                needsHostel: true,
                hostelRecord: null
            },
            include: { 
                class: true, 
                user: { select: { email: true, avatar: true } } 
            }
        });
        
        const formatted = pending.map(s => ({
            studentId: s.id,
            name: s.fullName,
            admissionNo: s.admissionNo,
            email: s.user.email,
            avatar: s.user.avatar,
            className: s.class.name,
            gender: s.gender
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending requests" });
    }
};

// --- 6. ALLOCATE ROOM ---
export const allocateRoom = async (req: Request, res: Response) => {
    try {
        const { studentId, roomId } = req.body;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { _count: { select: { allocations: { where: { status: 'OCCUPIED' } } } } }
        });

        if (!room || room._count.allocations >= room.capacity) {
            return res.status(400).json({ message: "Room is at full capacity" });
        }

        const allocation = await prisma.hostelAdmission.create({
            data: {
                studentId,
                roomId,
                status: 'OCCUPIED',
                admissionDate: new Date()
            }
        });

        res.status(201).json({ message: "Room allocated successfully", allocation });
    } catch (error) {
        console.error("Allocation Error:", error);
        res.status(500).json({ message: "Failed to allocate room" });
    }
};