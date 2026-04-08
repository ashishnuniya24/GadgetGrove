import { query } from '../config/db.js';

export const ensureSchema = async () => {
	await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

	await query(
		`CREATE TABLE IF NOT EXISTS product_comments (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			product_id UUID REFERENCES products(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`
	);

	await query(
		`CREATE TABLE IF NOT EXISTS comment_likes (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			comment_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			created_at TIMESTAMP DEFAULT NOW(),
			UNIQUE(comment_id, user_id)
		)`
	);

	await query(
		`CREATE TABLE IF NOT EXISTS feedback_reports (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			product_id UUID REFERENCES products(id) ON DELETE CASCADE,
			comment_id UUID REFERENCES product_comments(id) ON DELETE SET NULL,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			category VARCHAR(100) NOT NULL,
			message TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT NOW()
		)`
	);

	await query(
		`ALTER TABLE orders
		 ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) NOT NULL DEFAULT 'Card Payment'`
	);
};

export default ensureSchema;