import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);
// POST /api/auth/login
router.post('/login', login);
// GET /api/auth/me
router.get('/me', protect, getCurrentUser);

export default router;