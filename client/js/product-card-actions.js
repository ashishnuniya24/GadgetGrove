(function () {
	const api = window.GadgetGroveAPI;

	const createCatalogController = async ({
		grid,
		alertHost,
		emptyMessage = 'No products available.',
	}) => {
		if (!grid) {
			return null;
		}

		let wishlistIds = new Set();

		const showAlert = (message, type = 'success') => {
			if (!alertHost) {
				return;
			}

			alertHost.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
		};

		const formatCurrency = (amount) => api.formatCurrency(amount);

		const syncWishlistIds = async () => {
			if (!api?.isAuthenticated()) {
				wishlistIds = new Set();
				return;
			}

			try {
				const data = await api.getWishlist();
				wishlistIds = new Set((data.items || []).map((item) => item.product_id));
			} catch {
				wishlistIds = new Set();
			}
		};

		const setWishlistButtonState = (button, active) => {
			button.classList.toggle('active', active);
			button.setAttribute('aria-pressed', String(active));
			button.setAttribute('title', active ? 'Added to wishlist' : 'Add to wishlist');
			const icon = button.querySelector('.wishlist-icon');
			if (icon) {
				icon.textContent = active ? '♥' : '♡';
			}
		};

		const render = (products) => {
			grid.innerHTML = '';

			if (!products.length) {
				grid.innerHTML = `<div class="col-12"><div class="empty-state">${emptyMessage}</div></div>`;
				return;
			}

			products.forEach((product) => {
				const isInWishlist = wishlistIds.has(product.id);
				const card = document.createElement('div');
				card.className = 'col-12 col-sm-6 col-lg-4 col-xxl-3';
				card.innerHTML = `
					<article class="card product-card h-100">
						<a href="product-details.html?id=${product.id}">
							<img class="card-img-top product-media" src="${product.image_url}" alt="${product.name}" />
						</a>
						<div class="card-body p-4">
							<a class="text-decoration-none text-dark" href="product-details.html?id=${product.id}">
								<h3 class="h5 mb-2">${product.name}</h3>
							</a>
							<p class="text-secondary mb-3">${product.description}</p>
							<div class="mt-auto">
								<div class="d-flex justify-content-between align-items-center gap-3 mb-3">
									<p class="price mb-0">${formatCurrency(product.price)}</p>
									<a class="btn btn-outline-primary btn-sm" href="product-details.html?id=${product.id}">View</a>
								</div>
								<div class="product-card-actions d-flex align-items-center gap-2">
									<button class="btn btn-primary btn-sm flex-grow-1" data-action="cart" data-product-id="${product.id}" data-default-label="Add to Cart" type="button">Add to Cart</button>
									<button class="btn btn-outline-danger btn-icon wishlist-btn${isInWishlist ? ' active' : ''}" data-action="wishlist" data-product-id="${product.id}" aria-pressed="${isInWishlist}" title="${isInWishlist ? 'Added to wishlist' : 'Add to wishlist'}" type="button">
										<span class="wishlist-icon" aria-hidden="true">${isInWishlist ? '♥' : '♡'}</span>
									</button>
								</div>
							</div>
						</div>
					</article>
				`;
				grid.appendChild(card);
			});
		};

		await syncWishlistIds();

		if (!grid.dataset.actionsBound) {
			grid.dataset.actionsBound = 'true';
			grid.addEventListener('click', async (event) => {
				const button = event.target.closest('[data-action]');
				if (!button) {
					return;
				}

				const { action, productId } = button.dataset;

				if (!api?.isAuthenticated()) {
					showAlert('Please login to continue.', 'warning');
					window.setTimeout(() => {
						window.location.href = 'login.html';
					}, 900);
					return;
				}

				const defaultLabel = button.dataset.defaultLabel;
				button.disabled = true;

				try {
					if (action === 'cart') {
						await api.addToCart(productId, 1);
						button.textContent = 'Added';
						showAlert('Product added to cart.');
						window.setTimeout(() => {
							button.textContent = defaultLabel;
							button.disabled = false;
						}, 800);
						return;
					}

					if (wishlistIds.has(productId)) {
						setWishlistButtonState(button, true);
						showAlert('Product is already in your wishlist.', 'info');
						button.disabled = false;
						return;
					}

					await api.addToWishlist(productId);
					wishlistIds.add(productId);
					setWishlistButtonState(button, true);
					showAlert('Product added to wishlist.');
				} catch (error) {
					if (action === 'cart') {
						button.textContent = defaultLabel;
					}
					showAlert(error.message || 'Action failed.', 'danger');
				} finally {
					if (action !== 'cart') {
						button.disabled = false;
					}
				}
			});
		}

		document.addEventListener('gg-session-changed', async () => {
			await syncWishlistIds();
		});

		return { render, showAlert, syncWishlistIds };
	};

	window.GadgetGroveProductCards = {
		createCatalogController,
	};
})();