import express from 'express';
import { submitFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', submitFeedback);

export default router;