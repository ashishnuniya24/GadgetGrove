import Product from '../models/productModel.js';
import {
	getCartItemsByUserId,
	addCartItem,
	findCartItemById,
	updateCartItemQuantity,
	deleteCartItem,
	clearCartItems,
} from '../models/cartModel.js';

const shapeCartResponse = (items) => {
	const subtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0);
	return {
		items,
		summary: {
			itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
			subtotal,
		},
	};
};

export const getCart = async (req, res) => {
	try {
		const items = await getCartItemsByUserId(req.user.id);
		res.json(shapeCartResponse(items));
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch cart.', error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId, quantity = 1 } = req.body;
		if (!productId) {
			return res.status(400).json({ message: 'Product ID is required.' });
		}

		if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
			return res.status(400).json({ message: 'Quantity must be at least 1.' });
		}

		const product = await Product.getById(productId);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		await addCartItem({ userId: req.user.id, productId, quantity: Number(quantity) });
		const items = await getCartItemsByUserId(req.user.id);
		res.status(201).json({ message: 'Product added to cart.', ...shapeCartResponse(items) });
	} catch (error) {
		res.status(500).json({ message: 'Failed to add product to cart.', error: error.message });
	}
};

export const updateCartItem = async (req, res) => {
	try {
		const { id } = req.params;
		const { quantity } = req.body;

		if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
			return res.status(400).json({ message: 'Quantity must be at least 1.' });
		}

		const item = await findCartItemById(id, req.user.id);
		if (!item) {
			return res.status(404).json({ message: 'Cart item not found.' });
		}

		await updateCartItemQuantity({ itemId: id, userId: req.user.id, quantity: Number(quantity) });
		const items = await getCartItemsByUserId(req.user.id);
		res.json({ message: 'Cart updated.', ...shapeCartResponse(items) });
	} catch (error) {
		res.status(500).json({ message: 'Failed to update cart item.', error: error.message });
	}
};

export const removeCartItem = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await deleteCartItem(id, req.user.id);
		if (!deleted) {
			return res.status(404).json({ message: 'Cart item not found.' });
		}

		const items = await getCartItemsByUserId(req.user.id);
		res.json({ message: 'Item removed from cart.', ...shapeCartResponse(items) });
	} catch (error) {
		res.status(500).json({ message: 'Failed to remove cart item.', error: error.message });
	}
};

export const clearCart = async (req, res) => {
	try {
		await clearCartItems(req.user.id);
		res.json({ message: 'Cart cleared.', items: [], summary: { itemCount: 0, subtotal: 0 } });
	} catch (error) {
		res.status(500).json({ message: 'Failed to clear cart.', error: error.message });
	}
};
