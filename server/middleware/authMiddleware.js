import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
	let token;

	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		token = authHeader.split(' ')[1];
	}

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, token missing' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: decoded.id, email: decoded.email }; // basic info
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Not authorized, token invalid' });
	}
};

export const attachUserIfPresent = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next();
	}

	try {
		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: decoded.id, email: decoded.email };
	} catch {
		// Ignore invalid optional tokens and continue as guest.
	}

	next();
};

export default { protect, attachUserIfPresent };
