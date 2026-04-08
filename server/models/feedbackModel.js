import { query } from '../config/db.js';

export const createFeedbackReport = async ({ productId, commentId = null, userId, category, message }) => {
	const result = await query(
		`INSERT INTO feedback_reports (product_id, comment_id, user_id, category, message)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, product_id, comment_id, user_id, category, message, created_at`,
		[productId, commentId, userId, category, message]
	);

	return result.rows[0];
};