import db from '../config/db.js';


const Product = {
	async getAll() {
		const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
		return result.rows;
	},
	async getById(id) {
		const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
		return result.rows[0];
	},
};

export default Product;
