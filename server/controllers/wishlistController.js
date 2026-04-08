import Product from '../models/productModel.js';
import {
	getWishlistByUserId,
	addWishlistItem,
	removeWishlistItem,
	existsWishlistItem,
} from '../models/wishlistModel.js';

const sendServerError = (res, message, error) => {
	res.status(500).json({ message, error: error.message });
};

const getWishlistResponse = async (userId) => {
	const items = await getWishlistByUserId(userId);
	return { items, count: items.length };
};

export const getWishlist = async (req, res) => {
	try {
		res.json(await getWishlistResponse(req.user.id));
	} catch (error) {
		sendServerError(res, 'Failed to fetch wishlist.', error);
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
			return res.json({ message: 'Product already in wishlist.', ...(await getWishlistResponse(req.user.id)) });
		}

		await addWishlistItem({ userId: req.user.id, productId });
		res.status(201).json({ message: 'Product added to wishlist.', ...(await getWishlistResponse(req.user.id)) });
	} catch (error) {
		sendServerError(res, 'Failed to add to wishlist.', error);
	}
};

export const removeFromWishlist = async (req, res) => {
	try {
		const { productId } = req.params;
		const removed = await removeWishlistItem({ userId: req.user.id, productId });
		if (!removed) {
			return res.status(404).json({ message: 'Wishlist item not found.' });
		}

		res.json({ message: 'Product removed from wishlist.', ...(await getWishlistResponse(req.user.id)) });
	} catch (error) {
		sendServerError(res, 'Failed to remove wishlist item.', error);
	}
};
