// server/src/routes/hostelRoutes.ts
import { Router } from 'express';
import { 
    getHostelStats, 
    getPendingAllocations, 
    allocateRoom, 
    createRoom,
    createHostel,
    getAvailableRooms, // 1. IMPORT the new function
    getHostelResidents,
    deleteRoom,
    getAllResidents
} from '../controllers/hostelController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// --- Data Fetching ---
router.get('/stats', protect, getHostelStats);
router.get('/pending', protect, getPendingAllocations);

// 2. REGISTER: This line is what clears the 404 Not Found error
router.get('/rooms/available', protect, getAvailableRooms);
router.delete('/room/:roomId', protect, deleteRoom);

// --- Action Endpoints ---
router.post('/allocate', protect, allocateRoom);
router.post('/rooms', protect, authorize('super_admin', 'admin'), createRoom);
router.post('/create-hostel', protect, authorize('super_admin', 'admin'), createHostel);
router.get('/:hostelId/residents', protect, getHostelResidents);
router.get('/all-residents', protect, getAllResidents);

export default router;