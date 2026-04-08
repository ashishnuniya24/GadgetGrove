import { createOrderFromCart, getOrdersByUserId } from '../models/orderModel.js';

export const placeOrder = async (req, res) => {
	try {
		const { fullName, phone, address, city, postalCode, paymentMethod } = req.body;
		if (!fullName || !phone || !address || !city || !postalCode || !paymentMethod) {
			return res.status(400).json({ message: 'All checkout fields are required.' });
		}

		const order = await createOrderFromCart({
			userId: req.user.id,
			paymentMethod,
			fullName,
			phone,
			address,
			city,
			postalCode,
		});

		res.status(201).json({ message: 'Order placed successfully.', order });
	} catch (error) {
		const status = error.message === 'Cart is empty' ? 400 : 500;
		res.status(status).json({ message: error.message || 'Failed to place order.' });
	}
};

export const getOrders = async (req, res) => {
	try {
		const orders = await getOrdersByUserId(req.user.id);
		res.json({ orders, count: orders.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
	}
};
