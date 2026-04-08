import Product from '../models/productModel.js';
import { findCommentById } from '../models/commentModel.js';
import { createFeedbackReport } from '../models/feedbackModel.js';

export const submitFeedback = async (req, res) => {
	try {
		const { productId, commentId = null, category, message } = req.body;
		if (!productId || !category || !message || !message.trim()) {
			return res.status(400).json({ message: 'Product, category, and message are required.' });
		}

		const product = await Product.getById(productId);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		if (commentId) {
			const comment = await findCommentById(commentId);
			if (!comment || comment.product_id !== productId) {
				return res.status(404).json({ message: 'Comment not found for this product.' });
			}
		}

		const report = await createFeedbackReport({
			productId,
			commentId,
			userId: req.user.id,
			category,
			message: message.trim(),
		});

		res.status(201).json({ message: 'Feedback submitted successfully.', report });
	} catch (error) {
		res.status(500).json({ message: 'Failed to submit feedback.', error: error.message });
	}
};