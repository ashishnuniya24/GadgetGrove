import { createOrderFromCart, getOrdersByUserId } from '../models/orderModel.js';

const sendServerError = (res, message, error) => {
	res.status(500).json({ message, error: error.message });
};

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
		if (error.message === 'Cart is empty') {
			return res.status(400).json({ message: 'Cart is empty' });
		}

		sendServerError(res, 'Failed to place order.', error);
	}
};

export const getOrders = async (req, res) => {
	try {
		const orders = await getOrdersByUserId(req.user.id);
		res.json({ orders, count: orders.length });
	} catch (error) {
		sendServerError(res, 'Failed to fetch orders.', error);
	}
};
