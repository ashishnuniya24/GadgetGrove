(function () {
	const API_BASE_URL = 'http://localhost:5000/api';
	const TOKEN_KEY = 'gadgetgrove_token';
	const USER_KEY = 'gadgetgrove_user';
	const currencyFormatter = new Intl.NumberFormat('en-IE', {
		style: 'currency',
		currency: 'EUR',
	});

	const safeJsonParse = (value) => {
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	};

	const getToken = () => localStorage.getItem(TOKEN_KEY);
	const getStoredUser = () => safeJsonParse(localStorage.getItem(USER_KEY));

	const setSession = (token, user) => {
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));
		document.dispatchEvent(new CustomEvent('gg-session-changed'));
	};

	const clearSession = () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		document.dispatchEvent(new CustomEvent('gg-session-changed'));
	};

	const request = async (path, options = {}) => {
		const token = getToken();
		const headers = {
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(options.headers || {}),
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${path}`, {
			method: options.method || 'GET',
			headers,
			body: options.body ? JSON.stringify(options.body) : undefined,
		});

		const raw = await response.text();
		const data = raw ? safeJsonParse(raw) ?? { message: raw } : null;

		if (!response.ok) {
			if (response.status === 401) {
				clearSession();
			}

			const error = new Error(data?.message || 'Request failed.');
			error.status = response.status;
			error.data = data;
			throw error;
		}

		return data;
	};

	const syncNavbar = () => {
		const nav = document.querySelector('.navbar-nav');
		if (!nav) {
			return;
		}

		const loginItem = nav.querySelector('a[href="login.html"]')?.closest('li');
		const signupItem = nav.querySelector('a[href="signup.html"]')?.closest('li');
		const existingUserItem = nav.querySelector('[data-role="user"]');
		const existingLogoutItem = nav.querySelector('[data-role="logout"]');
		const user = getStoredUser();
		const authenticated = Boolean(getToken());

		if (!authenticated) {
			loginItem?.classList.remove('d-none');
			signupItem?.classList.remove('d-none');
			existingUserItem?.remove();
			existingLogoutItem?.remove();
			return;
		}

		loginItem?.classList.add('d-none');
		signupItem?.classList.add('d-none');

		if (user && !existingUserItem) {
			const userItem = document.createElement('li');
			userItem.className = 'nav-item';
			userItem.dataset.role = 'user';
			userItem.innerHTML = `<span class="nav-link disabled text-white-50">Hi, ${user.name.split(' ')[0]}</span>`;
			nav.appendChild(userItem);
		}

		if (!existingLogoutItem) {
			const logoutItem = document.createElement('li');
			logoutItem.className = 'nav-item';
			logoutItem.dataset.role = 'logout';
			logoutItem.innerHTML = '<a class="nav-link" href="#">Logout</a>';
			logoutItem.querySelector('a').addEventListener('click', (event) => {
				event.preventDefault();
				clearSession();
				window.location.href = 'login.html';
			});
			nav.appendChild(logoutItem);
		}
	};

	const bootstrapSession = async () => {
		const token = getToken();
		if (!token) {
			clearSession();
			return null;
		}

		try {
			const data = await request('/auth/me');
			if (data?.user) {
				localStorage.setItem(USER_KEY, JSON.stringify(data.user));
				document.dispatchEvent(new CustomEvent('gg-session-changed'));
			}
			return data?.user || null;
		} catch {
			return null;
		}
	};

	const requireAuth = (redirectTo = 'login.html') => {
		if (getToken()) {
			return true;
		}

		window.location.href = redirectTo;
		return false;
	};

	document.addEventListener('DOMContentLoaded', syncNavbar);
	document.addEventListener('gg-session-changed', syncNavbar);

	window.GadgetGroveAPI = {
		request,
		formatCurrency: (amount) => currencyFormatter.format(Number(amount) || 0),
		getToken,
		getStoredUser,
		setSession,
		clearSession,
		bootstrapSession,
		requireAuth,
		isAuthenticated: () => Boolean(getToken()),
		register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
		login: async (payload) => {
			const data = await request('/auth/login', { method: 'POST', body: payload });
			setSession(data.token, data.user);
			return data;
		},
		me: () => request('/auth/me'),
		getCart: () => request('/cart'),
		addToCart: (productId, quantity = 1) => request('/cart', { method: 'POST', body: { productId, quantity } }),
		updateCartItem: (id, quantity) => request(`/cart/${id}`, { method: 'PATCH', body: { quantity } }),
		removeCartItem: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
		clearCart: () => request('/cart', { method: 'DELETE' }),
		getWishlist: () => request('/wishlist'),
		addToWishlist: (productId) => request('/wishlist', { method: 'POST', body: { productId } }),
		removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
		getComments: (productId) => request(`/products/${productId}/comments`),
		addComment: (productId, content) => request(`/products/${productId}/comments`, { method: 'POST', body: { content } }),
		updateComment: (productId, commentId, content) => request(`/products/${productId}/comments/${commentId}`, { method: 'PATCH', body: { content } }),
		deleteComment: (productId, commentId) => request(`/products/${productId}/comments/${commentId}`, { method: 'DELETE' }),
		toggleCommentLike: (productId, commentId) => request(`/products/${productId}/comments/${commentId}/like`, { method: 'POST' }),
		submitFeedback: (payload) => request('/feedback', { method: 'POST', body: payload }),
		placeOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
		getOrders: () => request('/orders'),
	};
})();
