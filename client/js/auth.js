(function () {
	const api = window.GadgetGroveAPI;

	function showAlert(message, type = 'danger') {
		const alertHost = document.getElementById('auth-alert');
		if (!alertHost) {
			alert(message);
			return;
		}

		alertHost.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
	}

	function getSignupData() {
		return {
			name: document.getElementById('name').value.trim(),
			email: document.getElementById('email').value.trim(),
			password: document.getElementById('password').value,
			confirmPassword: document.getElementById('confirm-password').value,
			phone: document.getElementById('phone').value.trim(),
			address: document.getElementById('address').value.trim(),
		};
	}

	async function handleSignup(event) {
		event.preventDefault();
		const formData = getSignupData();

		if (formData.password !== formData.confirmPassword) {
			showAlert('Passwords do not match.', 'warning');
			return;
		}

		try {
			await api.register({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				phone: formData.phone,
				address: formData.address,
			});
			showAlert('Registration successful! Please login.', 'success');
			window.setTimeout(function () {
				window.location.href = 'login.html';
			}, 900);
		} catch (error) {
			showAlert(error.message || 'Network error. Please try again.');
		}
	}

	async function handleLogin(event) {
		event.preventDefault();
		const email = document.getElementById('email').value.trim();
		const password = document.getElementById('password').value;

		try {
			await api.login({ email, password });
			showAlert('Login successful.', 'success');
			window.setTimeout(function () {
				window.location.href = 'index.html';
			}, 600);
		} catch (error) {
			showAlert(error.message || 'Network error. Please try again.');
		}
	}

	const signupForm = document.getElementById('signup-form');
	if (signupForm) {
		signupForm.addEventListener('submit', handleSignup);
	}

	const loginForm = document.getElementById('login-form');
	if (loginForm) {
		loginForm.addEventListener('submit', handleLogin);
	}

	api?.bootstrapSession();
})();
