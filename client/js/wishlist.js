(function () {
	const api = window.GadgetGroveAPI;
	const formatCurrency = (amount) => api.formatCurrency(amount);

	document.addEventListener('DOMContentLoaded', async () => {
		const grid = document.getElementById('wishlistItemsGrid');
		if (!grid) {
			return;
		}

		const badge = document.getElementById('wishlistCountBadge');
		const alertHost = document.getElementById('wishlistAlert');

		const showAlert = (message, type = 'danger') => {
			alertHost.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
		};

		const renderWishlist = ({ items, count }) => {
			badge.textContent = `${count} Saved`;

			if (!items.length) {
				grid.innerHTML = '<div class="col-12"><div class="empty-state">Your wishlist is empty. Save products to see them here.</div></div>';
				return;
			}

			grid.innerHTML = items.map((item) => `
				<div class="col-12 col-md-6 col-xl-4">
					<div class="card border-0 shadow-sm h-100 product-card-static">
						<img src="${item.image_url}" alt="${item.name}" class="card-img-top product-media" />
						<div class="card-body p-4 d-flex flex-column">
							<h2 class="h5">${item.name}</h2>
							<p class="text-secondary">${item.description}</p>
							<div class="mt-auto d-flex justify-content-between align-items-center gap-2">
								<span class="fw-semibold">${formatCurrency(item.price)}</span>
								<div class="d-flex gap-2">
									<a class="btn btn-outline-primary btn-sm" href="product-details.html?id=${item.product_id}">View</a>
									<button class="btn btn-primary btn-sm" data-action="cart" data-product-id="${item.product_id}" type="button">Add to Cart</button>
								</div>
							</div>
							<button class="btn btn-link text-danger px-0 mt-3 align-self-start" data-action="remove" data-product-id="${item.product_id}" type="button">Remove</button>
						</div>
					</div>
				</div>
			`).join('');
		};

		const loadWishlist = async () => {
			try {
				const data = await api.getWishlist();
				renderWishlist(data);
			} catch (error) {
				showAlert(error.message || 'Failed to load wishlist.');
			}
		};

		if (!api.isAuthenticated()) {
			showAlert('Please login to access your wishlist.', 'warning');
			grid.innerHTML = '<div class="col-12"><div class="empty-state">Login is required to view your wishlist.</div></div>';
			return;
		}

		await api.bootstrapSession();
		await loadWishlist();

		grid.addEventListener('click', async (event) => {
			const control = event.target.closest('[data-action]');
			if (!control) {
				return;
			}

			const productId = control.dataset.productId;

			try {
				if (control.dataset.action === 'cart') {
					await api.addToCart(productId, 1);
					showAlert('Product added to cart.', 'success');
				}

				if (control.dataset.action === 'remove') {
					await api.removeFromWishlist(productId);
					showAlert('Product removed from wishlist.', 'success');
				}

				await loadWishlist();
			} catch (error) {
				showAlert(error.message || 'Wishlist action failed.');
			}
		});
	});
})();
