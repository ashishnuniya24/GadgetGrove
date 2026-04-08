(function () {
	const api = window.GadgetGroveAPI;
	const DELIVERY_FEE = 199;
	const formatCurrency = (amount) => api.formatCurrency(amount);

	document.addEventListener('DOMContentLoaded', async () => {
		const body = document.getElementById('cartItemsBody');
		if (!body) {
			return;
		}

		const countBadge = document.getElementById('cartItemCount');
		const subtotalNode = document.getElementById('cartSubtotal');
		const deliveryNode = document.getElementById('cartDelivery');
		const totalNode = document.getElementById('cartTotal');
		const alertHost = document.getElementById('cartAlert');
		const clearButton = document.getElementById('clearCartBtn');
		const checkoutButton = document.getElementById('checkoutBtn');

		const showAlert = (message, type = 'danger') => {
			alertHost.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
		};

		const renderCart = (cart) => {
			const { items, summary } = cart;
			const delivery = items.length ? DELIVERY_FEE : 0;
			countBadge.textContent = `${summary.itemCount} Items`;
			subtotalNode.textContent = formatCurrency(summary.subtotal);
			deliveryNode.textContent = formatCurrency(delivery);
			totalNode.textContent = formatCurrency(summary.subtotal + delivery);
			checkoutButton.classList.toggle('disabled', !items.length);
			clearButton.disabled = !items.length;

			if (!items.length) {
				body.innerHTML = '<tr><td colspan="5"><div class="empty-state my-3">Your cart is empty. Add products from the catalog to continue.</div></td></tr>';
				return;
			}

			body.innerHTML = items.map((item) => `
				<tr>
					<td>
						<div class="d-flex align-items-center gap-3">
							<img src="${item.image_url}" alt="${item.name}" width="64" height="64" class="rounded object-fit-cover" />
							<div>
								<div class="fw-semibold">${item.name}</div>
								<div class="text-secondary small">${item.description}</div>
							</div>
						</div>
					</td>
					<td>${formatCurrency(item.price)}</td>
					<td>
						<div class="d-inline-flex align-items-center gap-2">
							<button class="btn btn-outline-secondary btn-sm" data-action="decrease" data-id="${item.id}" data-quantity="${item.quantity}" type="button">-</button>
							<span class="badge text-bg-light border">${item.quantity}</span>
							<button class="btn btn-outline-secondary btn-sm" data-action="increase" data-id="${item.id}" data-quantity="${item.quantity}" type="button">+</button>
						</div>
					</td>
					<td>${formatCurrency(item.line_total)}</td>
					<td class="text-end"><button class="btn btn-outline-danger btn-sm" data-action="remove" data-id="${item.id}" type="button">Remove</button></td>
				</tr>
			`).join('');
		};

		const loadCart = async () => {
			try {
				const cart = await api.getCart();
				renderCart(cart);
			} catch (error) {
				showAlert(error.message || 'Failed to load cart.');
				body.innerHTML = '<tr><td colspan="5"><div class="empty-state my-3">Unable to load your cart right now.</div></td></tr>';
			}
		};

		if (!api.isAuthenticated()) {
			showAlert('Please login to access your cart.', 'warning');
			body.innerHTML = '<tr><td colspan="5"><div class="empty-state my-3">Login is required to view your cart.</div></td></tr>';
			checkoutButton.classList.add('disabled');
			clearButton.disabled = true;
			return;
		}

		await api.bootstrapSession();
		await loadCart();

		body.addEventListener('click', async (event) => {
			const control = event.target.closest('[data-action]');
			if (!control) {
				return;
			}

			const { action, id, quantity } = control.dataset;
			const currentQuantity = Number(quantity);

			try {
				if (action === 'increase') {
					await api.updateCartItem(id, currentQuantity + 1);
				}

				if (action === 'decrease') {
					if (currentQuantity === 1) {
						await api.removeCartItem(id);
					} else {
						await api.updateCartItem(id, currentQuantity - 1);
					}
				}

				if (action === 'remove') {
					await api.removeCartItem(id);
				}

				await loadCart();
			} catch (error) {
				showAlert(error.message || 'Unable to update cart.');
			}
		});

		clearButton.addEventListener('click', async () => {
			try {
				await api.clearCart();
				showAlert('Cart cleared.', 'success');
				await loadCart();
			} catch (error) {
				showAlert(error.message || 'Failed to clear cart.');
			}
		});
	});
})();
