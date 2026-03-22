import dotenv from 'dotenv';
import app from './app.js';
import { query } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	try {
		await query('SELECT 1');
		console.log('Database connected');
	} catch (error) {
		console.error('Database connection failed:', error.message);
	}

	app.listen(PORT, () => {
		console.log(`GadgetGrove server running at http://localhost:${PORT}`);
	});
};

startServer();
