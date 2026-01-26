// server/src/controllers/hostelController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// 1. Custom interface for authenticated routes
interface AuthenticatedRequest extends Request {
    user?: {
        id: string; // MongoDB ObjectId
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

// --- 2. GET AVAILABLE ROOMS ---
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
                        // Fetches full Cloudinary URL from MongoDB Atlas
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

// --- 4. GET ALL HOSTEL RESIDENTS (DIRECTORY) ---
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

// --- 6. STUDENT PORTAL: GET ALLOCATION (UPDATED for Roommate Avatars) ---
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
                                    include: { 
                                        student: { 
                                            select: { 
                                                id: true, 
                                                fullName: true, 
                                                class: { select: { name: true } },
                                                // FIXED: Including roommate avatar URL
                                                user: { select: { avatar: true } } 
                                            } 
                                        } 
                                    }
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
                className: a.student.class?.name || 'N/A',
                // Delivering full Cloudinary URL
                avatar: a.student.user?.avatar 
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

// --- 7. SUBMIT COMPLAINT ---
export const submitComplaint = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student record not found" });

        const { subject, category, description } = req.body;
        const complaint = await prisma.complaint.create({
            data: { subject, category, description, studentId: student.id, status: 'PENDING' }
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit grievance" });
    }
};

// --- 8. GET MY COMPLAINTS ---
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

// --- 13. GET PENDING REQUESTS (UPDATED for Avatars) ---
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
            // Delivering full Cloudinary URL
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
    const { studentId, roomId } = req.body;

    try {
        const [student, room] = await Promise.all([
            prisma.student.findUnique({ where: { id: studentId } }),
            prisma.room.findUnique({ 
                where: { id: roomId },
                include: { hostel: true } 
            })
        ]);

        if (!student || !room) {
            return res.status(404).json({ message: "Student or Room not found" });
        }

        const isMaleInBoys = student.gender === 'MALE' && room.hostel.type === 'BOYS';
        const isFemaleInGirls = student.gender === 'FEMALE' && room.hostel.type === 'GIRLS';

        if (!isMaleInBoys && !isFemaleInGirls) {
            return res.status(400).json({ 
                message: `Security Block: Cannot allocate a ${student.gender} student to a ${room.hostel.type} hostel.` 
            });
        }

        const occupiedCount = await prisma.hostelAdmission.count({
            where: { roomId: room.id, status: 'OCCUPIED' }
        });

        if (occupiedCount >= room.capacity) {
            return res.status(400).json({ message: "Selected room is already at full capacity" });
        }

        const allocation = await prisma.$transaction(async (tx) => {
            const record = await tx.hostelAdmission.create({
                data: {
                    studentId,
                    roomId,
                    admissionDate: new Date(),
                    status: 'OCCUPIED'
                }
            });

            await tx.student.update({
                where: { id: studentId },
                data: { needsHostel: false }
            });

            return record;
        });

        res.status(201).json({ message: "Room allocated successfully", allocation });

    } catch (error) {
        console.error("Allocation Error:", error);
        res.status(500).json({ message: "Internal server error during allocation" });
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

// --- 16. TRANSFER STUDENT TO NEW ROOM ---
export const transferResident = async (req: Request, res: Response) => {
    const { studentId, newRoomId } = req.body;

    try {
        const [student, currentAdmission, newRoom] = await Promise.all([
            prisma.student.findUnique({ where: { id: studentId } }),
            prisma.hostelAdmission.findFirst({ 
                where: { studentId, status: 'OCCUPIED' } 
            }),
            prisma.room.findUnique({ 
                where: { id: newRoomId }, 
                include: { hostel: true } 
            })
        ]);

        if (!student || !newRoom || !currentAdmission) {
            return res.status(404).json({ message: "Data missing for transfer." });
        }

        const isMaleInBoys = student.gender === 'MALE' && newRoom.hostel.type === 'BOYS';
        const isFemaleInGirls = student.gender === 'FEMALE' && newRoom.hostel.type === 'GIRLS';

        if (!isMaleInBoys && !isFemaleInGirls) {
            return res.status(400).json({ 
                message: `Security Block: Cannot transfer a ${student.gender} student to a ${newRoom.hostel.type} hostel.` 
            });
        }

        const occupiedCount = await prisma.hostelAdmission.count({
            where: { roomId: newRoomId, status: 'OCCUPIED' }
        });

        if (occupiedCount >= newRoom.capacity) {
            return res.status(400).json({ message: "Target room is at full capacity." });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedRecord = await tx.hostelAdmission.update({
                where: { id: currentAdmission.id },
                data: {
                    roomId: newRoomId,
                    admissionDate: new Date(), 
                    status: 'OCCUPIED'
                }
            });

            await tx.activity.create({
                data: {
                    action: "UPDATE",
                    message: `Transferred student ${student.fullName} to Room ${newRoom.roomNumber}`
                }
            });

            return updatedRecord;
        });

        res.status(200).json({ message: "Transfer successful", result });

    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ message: "Internal server error during transfer." });
    }
};

// --- 17. STUDENT: APPLY FOR GATE PASS ---
export const applyGatePass = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ message: "Student record not found" });

        const { reason, outTime, inTime, date } = req.body;

        const gatePass = await prisma.gatePass.create({
            data: {
                studentId: student.id,
                reason,
                outTime,
                inTime,
                date: new Date(date),
                status: 'PENDING'
            }
        });

        res.status(201).json(gatePass);
    } catch (error) {
        console.error("Gate Pass Application Error:", error);
        res.status(500).json({ message: "Failed to apply for gate pass" });
    }
};

// --- 18. STUDENT: GET PERSONAL GATE PASS HISTORY ---
export const getMyGatePasses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { userId } });
        
        const history = await prisma.gatePass.findMany({
            where: { studentId: student?.id },
            include: {
                admin: {
                    select: { fullName: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(history);
    } catch (error) {
        console.error("Fetch GatePass History Error:", error);
        res.status(500).json({ message: "Error fetching gate pass history" });
    }
};

// --- 19. ADMIN: GET ALL GATE PASSES (UPDATED for Avatars) ---
export const getAllGatePasses = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.gatePass.findMany({
            include: {
                student: {
                    include: {
                        class: { select: { name: true } },
                        user: { select: { avatar: true } }
                    }
                },
                admin: {
                    select: { fullName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Delivering flattened list with Cloudinary URLs
        const formatted = requests.map(r => ({
            ...r,
            studentAvatar: r.student.user?.avatar,
            studentName: r.student.fullName,
            admissionNo: r.student.admissionNo,
            className: r.student.class?.name || 'N/A'
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch gate pass requests" });
    }
};

// --- 20. ADMIN: APPROVE/REJECT GATE PASS ---
export const updateGatePassStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const wardenUserId = req.user?.id; 

        const adminProfile = await prisma.admin.findUnique({ where: { userId: wardenUserId } });

        const updated = await prisma.gatePass.update({
            where: { id },
            data: { 
                status,
                adminId: status === 'APPROVED' ? adminProfile?.id : null
            },
            include: {
                admin: { select: { fullName: true } }
            }
        });

        res.json({ message: `Gate pass status updated to ${status}`, updated });
    } catch (error) {
        console.error("Update GatePass Status Error:", error);
        res.status(500).json({ message: "Failed to update gate pass status" });
    }
};