import { query } from '../config/db.js';

export const getWishlistByUserId = async (userId) => {
	const result = await query(
		`SELECT w.id,
		        w.user_id,
		        w.product_id,
		        p.name,
		        p.description,
		        p.price,
		        p.image_url
		 FROM wishlist w
		 JOIN products p ON p.id = w.product_id
		 WHERE w.user_id = $1
		 ORDER BY w.id ASC`,
		[userId]
	);

	return result.rows;
};

export const addWishlistItem = async ({ userId, productId }) => {
	const result = await query(
		`INSERT INTO wishlist (user_id, product_id)
		 VALUES ($1, $2)
		 ON CONFLICT (user_id, product_id) DO NOTHING
		 RETURNING id, user_id, product_id`,
		[userId, productId]
	);

	return result.rows[0] || null;
};

export const removeWishlistItem = async ({ userId, productId }) => {
	const result = await query(
		'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
		[userId, productId]
	);

	return result.rows[0];
};

export const existsWishlistItem = async ({ userId, productId }) => {
	const result = await query(
		'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
		[userId, productId]
	);

	return result.rows[0];
};
