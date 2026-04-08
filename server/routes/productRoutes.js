import express from 'express';
import { getAllProducts, getProductById } from '../controllers/productController.js';
import {
	addComment,
	editComment,
	getComments,
	removeComment,
	toggleLikeComment,
} from '../controllers/commentController.js';
import { attachUserIfPresent, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products

// GET /api/products
router.get('/', getAllProducts);
router.get('/:id/comments', attachUserIfPresent, getComments);
router.post('/:id/comments', protect, addComment);
router.patch('/:id/comments/:commentId', protect, editComment);
router.delete('/:id/comments/:commentId', protect, removeComment);
router.post('/:id/comments/:commentId/like', protect, toggleLikeComment);

// GET /api/products/:id
router.get('/:id', getProductById);

export default router;
