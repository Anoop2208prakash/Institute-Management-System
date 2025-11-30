// server/src/routes/inventoryRoutes.ts
import { Router } from 'express';
import { getInventory, createItem, deleteItem } from '../controllers/inventoryController';

const router = Router();

router.get('/', getInventory);
router.post('/', createItem);
router.delete('/:id', deleteItem);

export default router;