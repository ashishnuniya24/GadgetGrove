(function() {
	const api = window.GadgetGroveAPI;
	const showAlert = (message, type = 'danger') => {
		const alertHost = document.getElementById('auth-alert');
		if (alertHost) {
			alertHost.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
			return;
		}

		alert(message);
	};

	// Signup form handler
	const signupForm = document.getElementById('signup-form');
	if (signupForm) {
		signupForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const name = document.getElementById('name').value.trim();
			const email = document.getElementById('email').value.trim();
			const password = document.getElementById('password').value;
			const confirmPassword = document.getElementById('confirm-password').value;
			const phone = document.getElementById('phone').value.trim();
			const address = document.getElementById('address').value.trim();

			if (password !== confirmPassword) {
				showAlert('Passwords do not match.', 'warning');
				return;
			}

			try {
				await api.register({ name, email, password, phone, address });
				showAlert('Registration successful! Please login.', 'success');
				window.setTimeout(() => {
					window.location.href = 'login.html';
				}, 900);
			} catch (err) {
				showAlert(err.message || 'Network error. Please try again.');
			}
		});
	}

	// Login form handler
	const loginForm = document.getElementById('login-form');
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const email = document.getElementById('email').value.trim();
			const password = document.getElementById('password').value;

			try {
				await api.login({ email, password });
				showAlert('Login successful.', 'success');
				window.setTimeout(() => {
					window.location.href = 'index.html';
				}, 600);
			} catch (err) {
				showAlert(err.message || 'Network error. Please try again.');
			}
		});
	}

	api?.bootstrapSession();
})();
