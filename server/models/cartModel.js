import { query } from '../config/db.js';

export const getCartItemsByUserId = async (userId) => {
	const result = await query(
		`SELECT ci.id,
		        ci.user_id,
		        ci.product_id,
		        ci.quantity,
		        p.name,
		        p.description,
		        p.price,
		        p.image_url,
		        (ci.quantity * p.price) AS line_total
		 FROM cart_items ci
		 JOIN products p ON p.id = ci.product_id
		 WHERE ci.user_id = $1
		 ORDER BY ci.id ASC`,
		[userId]
	);

	return result.rows;
};

export const addCartItem = async ({ userId, productId, quantity }) => {
	const existing = await query(
		'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
		[userId, productId]
	);

	if (existing.rows[0]) {
		const result = await query(
			`UPDATE cart_items
			 SET quantity = $3
			 WHERE id = $1 AND user_id = $2
			 RETURNING id, user_id, product_id, quantity`,
			[existing.rows[0].id, userId, existing.rows[0].quantity + quantity]
		);

		return result.rows[0];
	}

	const result = await query(
		`INSERT INTO cart_items (user_id, product_id, quantity)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, product_id, quantity`,
		[userId, productId, quantity]
	);

	return result.rows[0];
};

export const findCartItemById = async (itemId, userId) => {
	const result = await query(
		'SELECT * FROM cart_items WHERE id = $1 AND user_id = $2',
		[itemId, userId]
	);

	return result.rows[0];
};

export const updateCartItemQuantity = async ({ itemId, userId, quantity }) => {
	const result = await query(
		`UPDATE cart_items
		 SET quantity = $3
		 WHERE id = $1 AND user_id = $2
		 RETURNING id, user_id, product_id, quantity`,
		[itemId, userId, quantity]
	);

	return result.rows[0];
};

export const deleteCartItem = async (itemId, userId) => {
	const result = await query(
		'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
		[itemId, userId]
	);

	return result.rows[0];
};

export const clearCartItems = async (userId) => {
	await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};
