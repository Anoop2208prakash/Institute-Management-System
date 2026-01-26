// server/src/routes/orderRoutes.ts
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus, getMyOrders } from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/auth'; // UPDATED: Changed from authenticate to protect

const router = Router();

/**
 * @route   GET /api/orders
 * @desc    Admin Only: View all orders across the institution
 * @access  Private (Admin/Super Admin)
 */
router.get('/', authenticate, authorize(['super_admin', 'admin']), getOrders); 

/**
 * @route   POST /api/orders
 * @desc    Logged-in users can place new orders (Inventory/Hostel supplies)
 * @access  Private
 */
router.post('/', authenticate, createOrder); 

/**
 * @route   GET /api/orders/my-orders
 * @desc    Fetch order history for the currently logged-in user
 * @access  Private
 */
router.get('/my-orders', authenticate, getMyOrders); 

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Admin Only: Update the fulfillment status of an order
 * @access  Private (Admin/Super Admin)
 */
router.put('/:id/status', authenticate, authorize(['super_admin', 'admin']), updateOrderStatus);

export default router;