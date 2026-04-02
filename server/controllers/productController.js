export const getProductById = async (req, res) => {
	try {
		const { id } = req.params;
		const product = await Product.getById(id);
		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}
		res.json(product);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch product details' });
	}
};
import Product from '../models/productModel.js';

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.getAll();
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch products' });
	}
};
