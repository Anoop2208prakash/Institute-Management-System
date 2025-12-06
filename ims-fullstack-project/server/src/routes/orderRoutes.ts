import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus, getMyOrders } from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getOrders); // Admin view all
router.post('/', authenticate, createOrder); // Anyone can order
router.get('/my-orders', authenticate, getMyOrders); // View own orders
router.put('/:id/status', updateOrderStatus);

export default router;