(function () {
	const api = window.GadgetGroveAPI;
	const DELIVERY_FEE = 199;
	const formatCurrency = (amount) => api.formatCurrency(amount);

	document.addEventListener('DOMContentLoaded', async () => {
		const form = document.getElementById('checkout-form');
		if (!form) {
			return;
		}

		const alertHost = document.getElementById('checkoutAlert');
		const itemsList = document.getElementById('checkoutItems');
		const subtotalNode = document.getElementById('checkoutSubtotal');
		const deliveryNode = document.getElementById('checkoutDelivery');
		const totalNode = document.getElementById('checkoutTotal');
		const submitButton = document.getElementById('placeOrderBtn');

		const showAlert = (message, type = 'danger') => {
			alertHost.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
		};

		const renderSummary = (cart) => {
			const { items, summary } = cart;
			const delivery = items.length ? DELIVERY_FEE : 0;
			subtotalNode.textContent = formatCurrency(summary.subtotal);
			deliveryNode.textContent = formatCurrency(delivery);
			totalNode.textContent = formatCurrency(summary.subtotal + delivery);
			submitButton.disabled = !items.length;

			if (!items.length) {
				itemsList.innerHTML = '<li class="list-group-item px-0 text-secondary">Your cart is empty.</li>';
				return;
			}

			itemsList.innerHTML = items.map((item) => `
				<li class="list-group-item d-flex justify-content-between px-0 gap-3">
					<span>${item.name} x${item.quantity}</span>
					<span>${formatCurrency(item.line_total)}</span>
				</li>
			`).join('');
		};

		if (!api.isAuthenticated()) {
			showAlert('Please login to continue to checkout.', 'warning');
			form.classList.add('opacity-50');
			submitButton.disabled = true;
			return;
		}

		await api.bootstrapSession();
		const user = api.getStoredUser();
		if (user) {
			document.getElementById('checkoutName').value = user.name || '';
			document.getElementById('checkoutPhone').value = user.phone || '';
			document.getElementById('checkoutAddress').value = user.address || '';
		}

		try {
			const cart = await api.getCart();
			renderSummary(cart);
		} catch (error) {
			showAlert(error.message || 'Failed to load checkout summary.');
		}

		form.addEventListener('submit', async (event) => {
			event.preventDefault();

			const payload = {
				fullName: document.getElementById('checkoutName').value.trim(),
				phone: document.getElementById('checkoutPhone').value.trim(),
				address: document.getElementById('checkoutAddress').value.trim(),
				city: document.getElementById('checkoutCity').value.trim(),
				postalCode: document.getElementById('checkoutZip').value.trim(),
				paymentMethod: document.getElementById('checkoutPayment').value,
			};

			if (!payload.fullName || !payload.phone || !payload.address || !payload.city || !payload.postalCode || !payload.paymentMethod) {
				showAlert('Please complete all required checkout fields.', 'warning');
				return;
			}

			try {
				submitButton.disabled = true;
				const result = await api.placeOrder(payload);
				showAlert(`Order placed successfully. Order ID: ${result.order.id}`, 'success');
				itemsList.innerHTML = '<li class="list-group-item px-0 text-secondary">Your order has been placed. Cart is now empty.</li>';
				subtotalNode.textContent = formatCurrency(0);
				deliveryNode.textContent = formatCurrency(0);
				totalNode.textContent = formatCurrency(0);
				window.setTimeout(() => {
					window.location.href = 'cart.html';
				}, 1200);
			} catch (error) {
				submitButton.disabled = false;
				showAlert(error.message || 'Failed to place order.');
			}
		});
	});
})();
