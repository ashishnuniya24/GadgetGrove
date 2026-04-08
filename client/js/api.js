(function () {
	const API_BASE_URL = 'http://localhost:5000/api';
	const TOKEN_KEY = 'gadgetgrove_token';
	const USER_KEY = 'gadgetgrove_user';
	const currencyFormatter = new Intl.NumberFormat('en-IE', {
		style: 'currency',
		currency: 'EUR',
	});

	function safeJsonParse(value) {
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	}

	function emitSessionChange() {
		document.dispatchEvent(new CustomEvent('gg-session-changed'));
	}

	function getToken() {
		return localStorage.getItem(TOKEN_KEY);
	}

	function getStoredUser() {
		return safeJsonParse(localStorage.getItem(USER_KEY));
	}

	function setSession(token, user) {
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));
		emitSessionChange();
	}

	function clearSession() {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		emitSessionChange();
	}

	function formatCurrency(amount) {
		return currencyFormatter.format(Number(amount) || 0);
	}

	async function request(path, options = {}) {
		const headers = options.headers ? { ...options.headers } : {};
		const token = getToken();

		if (options.body) {
			headers['Content-Type'] = 'application/json';
		}

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${path}`, {
			method: options.method || 'GET',
			headers,
			body: options.body ? JSON.stringify(options.body) : undefined,
		});

		const rawText = await response.text();
		const data = rawText ? safeJsonParse(rawText) || { message: rawText } : null;

		if (!response.ok) {
			if (response.status === 401) {
				clearSession();
			}

			const error = new Error((data && data.message) || 'Request failed.');
			error.status = response.status;
			error.data = data;
			throw error;
		}

		return data;
	}

	function createLogoutItem() {
		const item = document.createElement('li');
		item.className = 'nav-item';
		item.dataset.role = 'logout';
		item.innerHTML = '<a class="nav-link" href="#">Logout</a>';

		item.querySelector('a').addEventListener('click', function (event) {
			event.preventDefault();
			clearSession();
			window.location.href = 'login.html';
		});

		return item;
	}

	function createUserItem(name) {
		const item = document.createElement('li');
		item.className = 'nav-item';
		item.dataset.role = 'user';
		item.innerHTML = `<span class="nav-link disabled text-white-50">Hi, ${name.split(' ')[0]}</span>`;
		return item;
	}

	function syncNavbar() {
		const nav = document.querySelector('.navbar-nav');
		if (!nav) {
			return;
		}

		const loginItem = nav.querySelector('a[href="login.html"]')?.closest('li');
		const signupItem = nav.querySelector('a[href="signup.html"]')?.closest('li');
		const userItem = nav.querySelector('[data-role="user"]');
		const logoutItem = nav.querySelector('[data-role="logout"]');
		const user = getStoredUser();

		if (!getToken()) {
			loginItem?.classList.remove('d-none');
			signupItem?.classList.remove('d-none');
			userItem?.remove();
			logoutItem?.remove();
			return;
		}

		loginItem?.classList.add('d-none');
		signupItem?.classList.add('d-none');

		if (user) {
			if (userItem) {
				userItem.innerHTML = `<span class="nav-link disabled text-white-50">Hi, ${user.name.split(' ')[0]}</span>`;
			} else {
				nav.appendChild(createUserItem(user.name));
			}
		}

		if (!logoutItem) {
			nav.appendChild(createLogoutItem());
		}
	}

	async function bootstrapSession() {
		if (!getToken()) {
			clearSession();
			return null;
		}

		try {
			const data = await request('/auth/me');
			if (data && data.user) {
				localStorage.setItem(USER_KEY, JSON.stringify(data.user));
				emitSessionChange();
				return data.user;
			}
		} catch {
			return null;
		}

		return null;
	}

	function requireAuth(redirectTo = 'login.html') {
		if (getToken()) {
			return true;
		}

		window.location.href = redirectTo;
		return false;
	}

	function isAuthenticated() {
		return Boolean(getToken());
	}

	document.addEventListener('DOMContentLoaded', syncNavbar);
	document.addEventListener('gg-session-changed', syncNavbar);

	window.GadgetGroveAPI = {
		request,
		formatCurrency,
		getToken,
		getStoredUser,
		setSession,
		clearSession,
		bootstrapSession,
		requireAuth,
		isAuthenticated,
		register(payload) {
			return request('/auth/register', { method: 'POST', body: payload });
		},
		async login(payload) {
			const data = await request('/auth/login', { method: 'POST', body: payload });
			setSession(data.token, data.user);
			return data;
		},
		me() {
			return request('/auth/me');
		},
		getCart() {
			return request('/cart');
		},
		addToCart(productId, quantity = 1) {
			return request('/cart', { method: 'POST', body: { productId, quantity } });
		},
		updateCartItem(id, quantity) {
			return request(`/cart/${id}`, { method: 'PATCH', body: { quantity } });
		},
		removeCartItem(id) {
			return request(`/cart/${id}`, { method: 'DELETE' });
		},
		clearCart() {
			return request('/cart', { method: 'DELETE' });
		},
		getWishlist() {
			return request('/wishlist');
		},
		addToWishlist(productId) {
			return request('/wishlist', { method: 'POST', body: { productId } });
		},
		removeFromWishlist(productId) {
			return request(`/wishlist/${productId}`, { method: 'DELETE' });
		},
		getComments(productId) {
			return request(`/products/${productId}/comments`);
		},
		addComment(productId, content) {
			return request(`/products/${productId}/comments`, { method: 'POST', body: { content } });
		},
		updateComment(productId, commentId, content) {
			return request(`/products/${productId}/comments/${commentId}`, { method: 'PATCH', body: { content } });
		},
		deleteComment(productId, commentId) {
			return request(`/products/${productId}/comments/${commentId}`, { method: 'DELETE' });
		},
		toggleCommentLike(productId, commentId) {
			return request(`/products/${productId}/comments/${commentId}/like`, { method: 'POST' });
		},
		submitFeedback(payload) {
			return request('/feedback', { method: 'POST', body: payload });
		},
		placeOrder(payload) {
			return request('/orders', { method: 'POST', body: payload });
		},
		getOrders() {
			return request('/orders');
		},
	};
})();
