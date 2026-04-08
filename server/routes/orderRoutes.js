import express from 'express';
import { placeOrder, getOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOrders);
router.post('/', placeOrder);

export default router;
