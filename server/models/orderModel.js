import db, { query } from '../config/db.js';

export const createOrderFromCart = async ({
	userId,
	paymentMethod,
	fullName,
	phone,
	address,
	city,
	postalCode,
}) => {
	const client = await db.connect();

	try {
		await client.query('BEGIN');

		const cartResult = await client.query(
			`SELECT ci.product_id, ci.quantity, p.price
			 FROM cart_items ci
			 JOIN products p ON p.id = ci.product_id
			 WHERE ci.user_id = $1`,
			[userId]
		);

		if (!cartResult.rows.length) {
			throw new Error('Cart is empty');
		}

		const totalPrice = cartResult.rows.reduce(
			(sum, item) => sum + Number(item.price) * item.quantity,
			0
		);

		const orderResult = await client.query(
			`INSERT INTO orders (user_id, total_price, payment_method, full_name, phone, address, city, postal_code)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING id, user_id, total_price, payment_method, full_name, phone, address, city, postal_code, created_at`,
			[userId, totalPrice, paymentMethod, fullName, phone, address, city, postalCode]
		);

		const order = orderResult.rows[0];

		for (const item of cartResult.rows) {
			await client.query(
				`INSERT INTO order_items (order_id, product_id, quantity, price)
				 VALUES ($1, $2, $3, $4)`,
				[order.id, item.product_id, item.quantity, item.price]
			);
		}

		await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
		await client.query('COMMIT');

		return order;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
};

export const getOrdersByUserId = async (userId) => {
	const result = await query(
		`SELECT id, total_price, payment_method, full_name, phone, address, city, postal_code, created_at
		 FROM orders
		 WHERE user_id = $1
		 ORDER BY created_at DESC`,
		[userId]
	);

	return result.rows;
};
