(function() {
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
				alert('Passwords do not match.');
				return;
			}

			try {
				const res = await fetch('http://localhost:5000/api/auth/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ name, email, password, phone, address })
				});
				const data = await res.json();
				if (res.ok) {
					alert('Registration successful! Please login.');
					window.location.href = 'login.html';
				} else {
					alert(data.message || 'Registration failed.');
				}
			} catch (err) {
				alert('Network error. Please try again.');
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
				const res = await fetch('http://localhost:5000/api/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, password })
				});
				const data = await res.json();
				if (res.ok) {
					// Login successful, redirect to homepage
					window.location.href = 'index.html';
				} else {
					alert(data.message || 'Login failed.');
				}
			} catch (err) {
				alert('Network error. Please try again.');
			}
		});
	}
})();
