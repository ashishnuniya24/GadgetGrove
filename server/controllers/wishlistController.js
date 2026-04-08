import Product from '../models/productModel.js';
import {
	getWishlistByUserId,
	addWishlistItem,
	removeWishlistItem,
	existsWishlistItem,
} from '../models/wishlistModel.js';

export const getWishlist = async (req, res) => {
	try {
		const items = await getWishlistByUserId(req.user.id);
		res.json({ items, count: items.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch wishlist.', error: error.message });
	}
};

export const addToWishlist = async (req, res) => {
	try {
		const { productId } = req.body;
		if (!productId) {
			return res.status(400).json({ message: 'Product ID is required.' });
		}

		const product = await Product.getById(productId);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		const existing = await existsWishlistItem({ userId: req.user.id, productId });
		if (existing) {
			const items = await getWishlistByUserId(req.user.id);
			return res.json({ message: 'Product already in wishlist.', items, count: items.length });
		}

		await addWishlistItem({ userId: req.user.id, productId });
		const items = await getWishlistByUserId(req.user.id);
		res.status(201).json({ message: 'Product added to wishlist.', items, count: items.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to add to wishlist.', error: error.message });
	}
};

export const removeFromWishlist = async (req, res) => {
	try {
		const { productId } = req.params;
		const removed = await removeWishlistItem({ userId: req.user.id, productId });
		if (!removed) {
			return res.status(404).json({ message: 'Wishlist item not found.' });
		}

		const items = await getWishlistByUserId(req.user.id);
		res.json({ message: 'Product removed from wishlist.', items, count: items.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to remove wishlist item.', error: error.message });
	}
};
