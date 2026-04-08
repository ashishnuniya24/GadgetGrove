import { query } from '../config/db.js';

export const getCommentsByProductId = async (productId, userId = null) => {
	const result = await query(
		`SELECT pc.id,
		        pc.product_id,
		        pc.user_id,
		        u.name AS user_name,
		        pc.content,
		        pc.created_at,
		        pc.updated_at,
		        EXISTS(
				SELECT 1
				FROM comment_likes cl
				WHERE cl.comment_id = pc.id AND cl.user_id = $2
			) AS liked_by_user,
		        (SELECT COUNT(*)::int FROM comment_likes cl WHERE cl.comment_id = pc.id) AS like_count
		 FROM product_comments pc
		 JOIN users u ON u.id = pc.user_id
		 WHERE pc.product_id = $1
		 ORDER BY pc.updated_at DESC, pc.created_at DESC`,
		[productId, userId]
	);

	return result.rows;
};

export const createComment = async ({ productId, userId, content }) => {
	const result = await query(
		`INSERT INTO product_comments (product_id, user_id, content)
		 VALUES ($1, $2, $3)
		 RETURNING id, product_id, user_id, content, created_at, updated_at`,
		[productId, userId, content]
	);

	return result.rows[0];
};

export const findCommentById = async (commentId) => {
	const result = await query('SELECT * FROM product_comments WHERE id = $1', [commentId]);
	return result.rows[0];
};

export const updateComment = async ({ commentId, userId, content }) => {
	const result = await query(
		`UPDATE product_comments
		 SET content = $3, updated_at = NOW()
		 WHERE id = $1 AND user_id = $2
		 RETURNING id, product_id, user_id, content, created_at, updated_at`,
		[commentId, userId, content]
	);

	return result.rows[0];
};

export const deleteComment = async ({ commentId, userId }) => {
	const result = await query(
		'DELETE FROM product_comments WHERE id = $1 AND user_id = $2 RETURNING id',
		[commentId, userId]
	);

	return result.rows[0];
};

export const hasUserLikedComment = async ({ commentId, userId }) => {
	const result = await query(
		'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
		[commentId, userId]
	);

	return result.rows[0];
};

export const addCommentLike = async ({ commentId, userId }) => {
	await query(
		'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT (comment_id, user_id) DO NOTHING',
		[commentId, userId]
	);
};

export const removeCommentLike = async ({ commentId, userId }) => {
	await query('DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
};

export const getCommentLikeCount = async (commentId) => {
	const result = await query('SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id = $1', [commentId]);
	return result.rows[0]?.count || 0;
};