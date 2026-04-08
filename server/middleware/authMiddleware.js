import jwt from 'jsonwebtoken';

const getTokenFromHeader = (authHeader) => {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}

	return authHeader.split(' ')[1];
};

const decodeToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const protect = (req, res, next) => {
	const token = getTokenFromHeader(req.headers.authorization);

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, token missing' });
	}

	try {
		const decoded = decodeToken(token);
		req.user = { id: decoded.id, email: decoded.email };
		next();
	} catch {
		return res.status(401).json({ message: 'Not authorized, token invalid' });
	}
};

export const attachUserIfPresent = (req, res, next) => {
	const token = getTokenFromHeader(req.headers.authorization);
	if (!token) {
		return next();
	}

	try {
		const decoded = decodeToken(token);
		req.user = { id: decoded.id, email: decoded.email };
	} catch {
		// Ignore invalid token here because this middleware is optional.
	}

	next();
};

export default { protect, attachUserIfPresent };
