// server/src/controllers/hostelController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// 1. Custom interface to fix 'req.user' property error
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

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
                    floor: r.floor,
                    _count: r._count
                }))
            };
        });

        res.json(formatted);
    } catch (error) {
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
        res.status(500).json({ message: "Failed to fetch available rooms" });
    }
};

// --- 3. GET HOSTEL RESIDENTS (BY BLOCK) ---
export const getHostelResidents = async (req: Request, res: Response) => {
    try {
        const { hostelId } = req.params;
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
            orderBy: { room: { roomNumber: 'asc' } }
        });

        const formatted = residents.map(r => ({
            id: r.student.id,
            name: r.student.fullName,
            admissionNo: r.student.admissionNo,
            className: r.student.class?.name || 'N/A',
            roomNumber: r.room.roomNumber,
            floor: r.room.floor,
            avatar: r.student.user?.avatar,
            admissionDate: r.admissionDate
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch residents" });
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
        room: { include: { hostel: true } }
      },
      orderBy: { student: { fullName: 'asc' } }
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
      avatar: r.student.user?.avatar, 
      admissionDate: r.admissionDate 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- 5. UPDATE ROOM DETAILS ---
export const updateRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const { roomNumber, floor, capacity } = req.body;

        const currentOccupancy = await prisma.hostelAdmission.count({
            where: { roomId, status: 'OCCUPIED' }
        });

        if (parseInt(capacity) < currentOccupancy) {
            return res.status(400).json({ 
                message: `Cannot reduce capacity below current occupancy of ${currentOccupancy} residents.` 
            });
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                roomNumber,
                floor: floor ? parseInt(floor) : null,
                capacity: parseInt(capacity)
            }
        });

        res.json({ message: "Room details updated", updatedRoom });
    } catch (error) {
        res.status(500).json({ message: "Failed to update room" });
    }
};

// --- 6. GET STUDENT'S OWN ALLOCATION (STUDENT PORTAL) ---
export const getMyAllocation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                hostelRecord: {
                    include: {
                        room: {
                            include: {
                                hostel: true,
                                allocations: {
                                    where: { status: 'OCCUPIED' },
                                    include: { student: { select: { id: true, fullName: true, class: { select: { name: true } } } } }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!student || !student.hostelRecord || student.hostelRecord.status !== 'OCCUPIED') {
            return res.status(404).json({ message: "No active room assignment found." });
        }

        const room = student.hostelRecord.room;

        const roommates = room.allocations
            .filter(a => a.student.id !== student.id)
            .map(a => ({
                id: a.student.id,
                name: a.student.fullName,
                className: a.student.class?.name || 'N/A'
            }));

        res.json({
            hostelName: room.hostel.name,
            roomNumber: room.roomNumber,
            floor: room.floor,
            capacity: room.capacity,
            occupants: room.allocations.length,
            roommates: roommates
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch allocation details" });
    }
};

// --- 7. SUBMIT COMPLAINT (STUDENT - NEW) ---
export const submitComplaint = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        
        if (!student) return res.status(404).json({ message: "Student record not found" });

        const { subject, category, description } = req.body;
        const complaint = await prisma.complaint.create({
            data: {
                subject,
                category,
                description,
                studentId: student.id,
                status: 'PENDING'
            }
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit grievance" });
    }
};

// --- 8. GET MY COMPLAINTS (STUDENT - NEW) ---
export const getMyComplaints = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        
        if (!student) return res.status(404).json({ message: "Student record not found" });

        const history = await prisma.complaint.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to load complaint history" });
    }
};

// --- 9. CHECK-OUT STUDENT ---
export const checkoutStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        await prisma.hostelAdmission.update({
            where: { id },
            data: { status: 'VACATED', checkoutDate: new Date() }
        });
        res.json({ message: "Student checked out successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to process check-out" });
    }
};

// --- 10. GET GATE PASS DATA ---
export const getGatePassData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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
            photo: record.student.user?.avatar,
            class: record.student.class?.name || 'N/A',
            hostel: record.room.hostel.name,
            room: record.room.roomNumber,
            issueDate: new Date().toLocaleDateString('en-GB')
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating gate pass data" });
    }
};

// --- 11. CREATE NEW HOSTEL BLOCK ---
export const createHostel = async (req: Request, res: Response) => {
    try {
        const { name, type, capacity } = req.body;
        const newHostel = await prisma.hostel.create({
            data: { name, type, capacity: parseInt(capacity) || 0 }
        });
        res.status(201).json(newHostel);
    } catch (error) {
        res.status(500).json({ message: "Failed to create hostel block" });
    }
};

// --- 12. CREATE NEW ROOM ---
export const createRoom = async (req: Request, res: Response) => {
    try {
        const { roomNumber, floor, capacity, hostelId } = req.body;
        const existingRoom = await prisma.room.findFirst({ where: { roomNumber, hostelId } });

        if (existingRoom) return res.status(400).json({ message: "Room already exists" });

        const newRoom = await prisma.room.create({
            data: { 
                roomNumber, 
                floor: floor ? parseInt(floor) : null, 
                capacity: parseInt(capacity), 
                hostelId 
            }
        });
        res.status(201).json({ message: "Room created", room: newRoom });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 13. GET PENDING REQUESTS ---
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
            className: s.class?.name || 'N/A',
            gender: s.gender
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending requests" });
    }
};

// --- 14. ALLOCATE ROOM ---
export const allocateRoom = async (req: Request, res: Response) => {
    try {
        const { studentId, roomId } = req.body;
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { _count: { select: { allocations: { where: { status: 'OCCUPIED' } } } } }
        });

        if (!room || room._count.allocations >= room.capacity) {
            return res.status(400).json({ message: "Room is full" });
        }

        const allocation = await prisma.hostelAdmission.create({
            data: { studentId, roomId, status: 'OCCUPIED', admissionDate: new Date() }
        });

        res.status(201).json({ message: "Room allocated", allocation });
    } catch (error) {
        res.status(500).json({ message: "Failed to allocate room" });
    }
};

// --- 15. DELETE ROOM ---
export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const activeAllocations = await prisma.hostelAdmission.count({
            where: { roomId: roomId, status: 'OCCUPIED' }
        });

        if (activeAllocations > 0) {
            return res.status(400).json({ message: "Cannot delete room with active residents." });
        }

        await prisma.room.delete({ where: { id: roomId } });
        res.json({ message: "Room removed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove room." });
    }
};