// server/src/routes/orderRoutes.ts
import { Router } from 'express';
import { getOrders, updateOrderStatus, createOrder } from '../controllers/orderController';

const router = Router();

router.get('/', getOrders);
router.post('/', createOrder); // Admin manual creation
router.put('/:id/status', updateOrderStatus);

export default router;