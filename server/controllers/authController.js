import { createUser, findUserByEmail } from '../models/userModel.js';
import { hashPassword } from '../utils/hashPassword.js';

export const register = async (req, res) => {
	try {
		const { name, email, password, phone, address } = req.body;
		if (!name || !email || !password || !phone || !address) {
			return res.status(400).json({ message: 'All fields are required.' });
		}
		const existing = await findUserByEmail(email);
		if (existing) {
			return res.status(409).json({ message: 'Email already registered.' });
		}
		const hashed = await hashPassword(password);
		const user = await createUser({ name, email, password: hashed, phone, address });
		res.status(201).json({
			message: 'User registered successfully.',
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				created_at: user.created_at,
			},
		});
	} catch (err) {
		res.status(500).json({ message: 'Registration failed.', error: err.message });
	}
};
