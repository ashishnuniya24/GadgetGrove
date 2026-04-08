import { query } from '../config/db.js';

const sampleProducts = [
	{
		name: 'Smartphone X',
		description: 'Latest smartphone with amazing features.',
		price: 699.99,
		image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Wireless Headphones',
		description: 'Experience music like never before.',
		price: 199.99,
		image_url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Smartwatch Pro',
		description: 'Track your fitness and stay connected.',
		price: 299.99,
		image_url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Bluetooth Speaker',
		description: 'Portable speaker with deep bass.',
		price: 89.99,
		image_url: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRUMWWfCCCUBxR5v4EixLjBt_KyAII0O0zZ0kTbsy4WZfw46D1KtYiuIWVn8UQFVIdyP6IqKUWcgQTiNpEdLQs7erXE10gC2nXGhThO9ebLk4HFVW8GNoRSRQ',
	},
	{
		name: 'Gaming Laptop',
		description: 'High performance laptop for gaming.',
		price: 1299.99,
		image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: '4K Action Camera',
		description: 'Capture adventures with ultra-sharp 4K recording and image stabilization.',
		price: 249.99,
		image_url: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQWLxPqKWUHerRzFu22RKy1EFSXLSVzxLZfw4DGa-M3OZ6xwQWk-k-OP42IP1GCd1H_1LMDiZuslrL1GUAtDb8AH-8MvHFja-Td8Z8885Tp9axzYSsPOY12XJ4',
	},
	{
		name: 'Mechanical Keyboard',
		description: 'Tactile keys, premium build quality, and a compact desk-friendly design.',
		price: 119.99,
		image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Noise Cancelling Earbuds',
		description: 'Enjoy immersive audio with adaptive noise cancellation and long battery life.',
		price: 159.99,
		image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'UltraWide Monitor',
		description: 'Boost productivity with a panoramic display for work, streaming, and gaming.',
		price: 549.99,
		image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Portable SSD 1TB',
		description: 'Fast, reliable storage for creators, students, and professionals on the move.',
		price: 139.99,
		image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Wireless Charging Stand',
		description: 'Charge your phone upright with a sleek stand for desk or bedside use.',
		price: 39.99,
		image_url: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQOBkZqztizwDgCF6glTfwNzq37XnHSKyRl-2FbdZDDia5XWPA8MXrBy7vtmGjJAuROjMD7oAs7G2UMaSbSLUZ0ZIt3SnnTgIL5Ks35ZoDKEIV4Cm9yiiN70Ts',
	},
	{
		name: 'Fitness Band Lite',
		description: 'Track steps, sleep, and heart rate in a lightweight all-day wearable.',
		price: 59.99,
		image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Gaming Mouse RGB',
		description: 'Precision sensor, ergonomic grip, and customizable lighting for competitive play.',
		price: 69.99,
		image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=400&q=80',
	},
	{
		name: 'Tablet Air 11',
		description: 'A slim tablet for entertainment, sketching, and productivity on the go.',
		price: 429.99,
		image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80',
	},
];

export const seedProducts = async () => {
	for (const product of sampleProducts) {
		await query(
			`INSERT INTO products (name, description, price, image_url)
			 SELECT $1::varchar, $2::text, $3::decimal(10,2), $4::text
			 WHERE NOT EXISTS (
				SELECT 1 FROM products WHERE LOWER(name) = LOWER($1::text)
			 )`,
			[product.name, product.description, product.price, product.image_url]
		);
	}

	const result = await query('SELECT COUNT(*)::int AS count FROM products');
	return result.rows[0]?.count || 0;
};

export default seedProducts;