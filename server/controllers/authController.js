import { createUser, findUserByEmail } from '../models/userModel.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';

const buildUserResponse = (user) => ({
	id: user.id,
	name: user.name,
	email: user.email,
	phone: user.phone,
	address: user.address,
});

const sendServerError = (res, message, err) => {
	res.status(500).json({ message, error: err.message });
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}
		const user = await findUserByEmail(email);
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}
		const isMatch = await comparePassword(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}
		const token = generateToken({ id: user.id, email: user.email });
		res.json({
			message: 'Login successful.',
			token,
			user: buildUserResponse(user),
		});
	} catch (err) {
		sendServerError(res, 'Login failed.', err);
	}
};

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
				...buildUserResponse(user),
				created_at: user.created_at,
			},
		});
	} catch (err) {
		sendServerError(res, 'Registration failed.', err);
	}
};

export const getCurrentUser = async (req, res) => {
	try {
		const user = await findUserByEmail(req.user.email);
		if (!user) {
			return res.status(404).json({ message: 'User not found.' });
		}

		res.json({ user: buildUserResponse(user) });
	} catch (err) {
		sendServerError(res, 'Failed to fetch user.', err);
	}
};
