import dotenv from 'dotenv';
import app from './app.js';
import { query } from './config/db.js';
import { ensureSchema } from './db/ensureSchema.js';
import { seedProducts } from './db/seedProducts.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	try {
		await query('SELECT 1');
		await ensureSchema();
		const productCount = await seedProducts();
		console.log('Database connected');
		console.log(`Product catalog ready with ${productCount} products`);
	} catch (error) {
		console.error('Database connection failed:', error.message);
	}

	app.listen(PORT, () => {
		console.log(`GadgetGrove server running at http://localhost:${PORT}`);
	});
};

startServer();
