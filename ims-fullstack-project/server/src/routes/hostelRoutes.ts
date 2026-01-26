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
    submitComplaint,
    transferResident,
    applyGatePass,
    getMyGatePasses,
    getAllGatePasses,
    updateGatePassStatus
} from '../controllers/hostelController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// --- Data Fetching ---
router.get('/stats', authenticate, getHostelStats);
router.get('/pending', authenticate, getPendingAllocations);
router.get('/rooms/available', authenticate, getAvailableRooms);

// --- Student Specific Portal ---
// Uses 'authenticate' to ensure the student is logged in
router.get('/my-allocation', authenticate, getMyAllocation); 
// --- Action Endpoints ---
router.get('/all-residents', authenticate, getAllResidents);
router.get('/:hostelId/residents', authenticate, getHostelResidents);
router.get('/gate-pass/:id', authenticate, getGatePassData);

// --- Management Endpoints (Admin/Super Admin only) ---
router.post('/allocate', authenticate, authorize(['super_admin', 'admin','warden']), allocateRoom);
router.post('/rooms', authenticate, authorize(['super_admin', 'admin','warden']), createRoom);
router.put('/room/:roomId', authenticate, authorize(['super_admin', 'admin','warden']), updateRoom); // NEW: Edit Room Route
router.post('/create-hostel', authenticate, authorize(['super_admin', 'admin','warden']), createHostel);
router.patch('/checkout/:id', authenticate, authorize(['super_admin', 'admin','warden']), checkoutStudent); // NEW: Checkout Route
router.delete('/room/:roomId', authenticate, authorize(['super_admin', 'admin','warden']), deleteRoom);
router.post('/transfer', authenticate, authorize(['super_admin', 'admin','warden']), transferResident);
router.get('/my-complaints', authenticate, getMyComplaints);
router.post('/submit-complaint', authenticate, submitComplaint);
router.post('/gatepass/apply', authenticate, applyGatePass);
router.get('/gatepass/my-requests', authenticate, getMyGatePasses);
router.get('/gatepass/all', authenticate, authorize(['super_admin', 'admin', 'warden']), getAllGatePasses);

// Warden/Admin access to update status
router.patch('/gatepass/:id/status', authenticate, authorize(['super_admin', 'admin', 'warden']), updateGatePassStatus);

export default router;