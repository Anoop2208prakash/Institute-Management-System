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
                    orderBy: { roomNumber: 'asc' }, 
                    include: {
                        _count: { 
                            select: { allocations: { where: { status: 'OCCUPIED' } } } 
                        }
                    }
                }
            },
            orderBy: { name: 'asc' } 
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
export const getAvailableRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                hostel: { select: { name: true } },
                _count: {
                    select: { allocations: { where: { status: 'OCCUPIED' } } }
                }
            },
            orderBy: { roomNumber: 'asc' } 
        });

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

// --- 3. GET HOSTEL RESIDENTS (BY BLOCK) ---
export const getHostelResidents = async (req: Request, res: Response) => {
    try {
        const { hostelId } = req.params;

        if (!hostelId) {
            return res.status(400).json({ message: "Hostel ID is required" });
        }

        const residents = await prisma.hostelAdmission.findMany({
            where: {
                room: { hostelId: hostelId },
                status: 'OCCUPIED'
            },
            include: {
                student: {
                    include: { 
                        class: { select: { name: true } },
                        user: { select: { avatar: true, email: true } }
                    }
                },
                room: { select: { roomNumber: true, floor: true } }
            },
            orderBy: {
                room: { roomNumber: 'asc' } 
            }
        });

        const formatted = residents.map(r => ({
            id: r.student.id,
            name: r.student.fullName,
            admissionNo: r.student.admissionNo,
            className: r.student.class?.name || 'N/A',
            roomNumber: r.room.roomNumber,
            floor: r.room.floor,
            avatar: r.student.user.avatar,
            admissionDate: r.admissionDate
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Fetch Residents Error:", error);
        res.status(500).json({ message: "Failed to fetch residents for this block" });
    }
};

// --- 4. GET ALL HOSTEL RESIDENTS (FOR DIRECTORY PAGE) ---
export const getAllResidents = async (req: Request, res: Response) => {
  try {
    const residents = await prisma.hostelAdmission.findMany({
      where: { status: 'OCCUPIED' },
      include: {
        student: {
            include: { 
                class: true,
                user: { select: { avatar: true } } 
            }
        },
        room: {
            include: { hostel: true }
        }
      },
      orderBy: {
        student: { fullName: 'asc' } 
      }
    });

    const formatted = residents.map(r => ({
      id: r.id,
      name: r.student.fullName,
      admissionNo: r.student.admissionNo,
      className: r.student.class?.name || 'N/A',
      hostelName: r.room.hostel.name,
      roomNumber: r.room.roomNumber,
      floor: r.room.floor,
      phone: r.student.phone,
      avatar: r.student.user.avatar, 
      admissionDate: r.admissionDate 
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Directory Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- 5. CHECK-OUT STUDENT ---
export const checkoutStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 

        await prisma.hostelAdmission.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });

        res.json({ message: "Student checked out successfully. Bed is now vacant." });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: "Failed to process check-out" });
    }
};

// --- 6. GET GATE PASS DATA ---
export const getGatePassData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Using the Admission record ID

        const record = await prisma.hostelAdmission.findUnique({
            where: { id: id },
            include: {
                student: {
                    include: { 
                        class: { select: { name: true } },
                        user: { select: { avatar: true } } 
                    }
                },
                room: { include: { hostel: true } }
            }
        });

        if (!record || record.status !== 'OCCUPIED') {
            return res.status(404).json({ message: "No active hostel record found" });
        }

        res.json({
            name: record.student.fullName,
            id: record.student.admissionNo,
            photo: record.student.user.avatar,
            class: record.student.class?.name || 'N/A',
            hostel: record.room.hostel.name,
            room: record.room.roomNumber,
            issueDate: new Date().toLocaleDateString('en-GB')
        });
    } catch (error) {
        console.error("Gate Pass Error:", error);
        res.status(500).json({ message: "Error generating gate pass data" });
    }
};

// --- 7. CREATE NEW HOSTEL BLOCK ---
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

// --- 8. CREATE NEW ROOM & FLOOR ---
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

// --- 9. GET PENDING ALLOCATIONS ---
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
            },
            orderBy: { fullName: 'asc' } 
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

// --- 10. ALLOCATE ROOM ---
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

// --- 11. DELETE ROOM ---
export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({ message: "Room ID is required" });
        }

        const activeAllocations = await prisma.hostelAdmission.count({
            where: { roomId: roomId, status: 'OCCUPIED' }
        });

        if (activeAllocations > 0) {
            return res.status(400).json({ 
                message: "Safety Block: Cannot delete room while it has active residents. Please check-out students first." 
            });
        }

        await prisma.room.delete({ where: { id: roomId } });

        res.json({ message: "Room removed successfully from the block." });
    } catch (error) {
        console.error("Delete Room Error:", error);
        res.status(500).json({ message: "Failed to remove room. It might be linked to historical records." });
    }
};