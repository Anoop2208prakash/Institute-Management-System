// server/src/routes/hostelRoutes.ts
import { Router } from 'express';
import { 
    getHostelStats, 
    getPendingAllocations, 
    allocateRoom, 
    createRoom,
    updateRoom,        // NEW: Import for editing
    createHostel,
    getAvailableRooms, 
    getHostelResidents,
    deleteRoom,
    getAllResidents,
    checkoutStudent,   // NEW: Import
    getGatePassData,   // NEW: Import
    getMyAllocation,    // NEW: Student Portal Import
    getMyComplaints,
    submitComplaint
} from '../controllers/hostelController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// --- Data Fetching ---
router.get('/stats', protect, getHostelStats);
router.get('/pending', protect, getPendingAllocations);
router.get('/rooms/available', protect, getAvailableRooms);

// --- Student Specific Portal ---
// Uses 'protect' to ensure the student is logged in
router.get('/my-allocation', protect, getMyAllocation); 

// --- Action Endpoints ---
router.get('/all-residents', protect, getAllResidents);
router.get('/:hostelId/residents', protect, getHostelResidents);
router.get('/gate-pass/:id', protect, getGatePassData);

// --- Management Endpoints (Admin/Super Admin only) ---
router.post('/allocate', protect, authorize('super_admin', 'admin'), allocateRoom);
router.post('/rooms', protect, authorize('super_admin', 'admin'), createRoom);
router.put('/room/:roomId', protect, authorize('super_admin', 'admin'), updateRoom); // NEW: Edit Room Route
router.post('/create-hostel', protect, authorize('super_admin', 'admin'), createHostel);
router.patch('/checkout/:id', protect, authorize('super_admin', 'admin'), checkoutStudent); // NEW: Checkout Route
router.delete('/room/:roomId', protect, authorize('super_admin', 'admin'), deleteRoom);
router.get('/my-complaints', protect, getMyComplaints);
router.post('/submit-complaint', protect, submitComplaint);

export default router;