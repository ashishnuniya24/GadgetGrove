import { query } from '../config/db.js';

export const createUser = async ({ name, email, password, phone, address }) => {
	const result = await query(
		`INSERT INTO users (name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, created_at`,
		[name, email, password, phone, address]
	);
	return result.rows[0];
};

export const findUserByEmail = async (email) => {
	const result = await query('SELECT * FROM users WHERE email = $1', [email]);
	return result.rows[0];
};
