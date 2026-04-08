(function () {
	const api = window.GadgetGroveAPI;

	function showAlert(alertHost, message, type = 'success') {
		if (!alertHost) {
			return;
		}

		alertHost.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
	}

	function setWishlistButtonState(button, isActive) {
		button.classList.toggle('active', isActive);
		button.setAttribute('aria-pressed', String(isActive));
		button.setAttribute('title', isActive ? 'Added to wishlist' : 'Add to wishlist');

		const icon = button.querySelector('.wishlist-icon');
		if (icon) {
			icon.textContent = isActive ? '♥' : '♡';
		}
	}

	function createCardHtml(product, isInWishlist) {
		return `
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
							<p class="price mb-0">${api.formatCurrency(product.price)}</p>
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
	}

	async function createCatalogController({ grid, alertHost, emptyMessage = 'No products available.' }) {
		if (!grid) {
			return null;
		}

		let wishlistIds = new Set();

		async function syncWishlistIds() {
			if (!api || !api.isAuthenticated()) {
				wishlistIds = new Set();
				return;
			}

			try {
				const data = await api.getWishlist();
				wishlistIds = new Set((data.items || []).map((item) => item.product_id));
			} catch {
				wishlistIds = new Set();
			}
		}

		function render(products) {
			grid.innerHTML = '';

			if (!products.length) {
				grid.innerHTML = `<div class="col-12"><div class="empty-state">${emptyMessage}</div></div>`;
				return;
			}

			products.forEach(function (product) {
				const column = document.createElement('div');
				column.className = 'col-12 col-sm-6 col-lg-4 col-xxl-3';
				column.innerHTML = createCardHtml(product, wishlistIds.has(product.id));
				grid.appendChild(column);
			});
		}

		async function handleCart(button, productId) {
			const defaultLabel = button.dataset.defaultLabel;
			button.disabled = true;

			try {
				await api.addToCart(productId, 1);
				button.textContent = 'Added';
				showAlert(alertHost, 'Product added to cart.');
				window.setTimeout(function () {
					button.textContent = defaultLabel;
					button.disabled = false;
				}, 800);
			} catch (error) {
				button.textContent = defaultLabel;
				button.disabled = false;
				showAlert(alertHost, error.message || 'Action failed.', 'danger');
			}
		}

		async function handleWishlist(button, productId) {
			button.disabled = true;

			try {
				if (wishlistIds.has(productId)) {
					setWishlistButtonState(button, true);
					showAlert(alertHost, 'Product is already in your wishlist.', 'info');
					return;
				}

				await api.addToWishlist(productId);
				wishlistIds.add(productId);
				setWishlistButtonState(button, true);
				showAlert(alertHost, 'Product added to wishlist.');
			} catch (error) {
				showAlert(alertHost, error.message || 'Action failed.', 'danger');
			} finally {
				button.disabled = false;
			}
		}

		await syncWishlistIds();

		if (!grid.dataset.actionsBound) {
			grid.dataset.actionsBound = 'true';
			grid.addEventListener('click', async function (event) {
				const button = event.target.closest('[data-action]');
				if (!button) {
					return;
				}

				if (!api || !api.isAuthenticated()) {
					showAlert(alertHost, 'Please login to continue.', 'warning');
					window.setTimeout(function () {
						window.location.href = 'login.html';
					}, 900);
					return;
				}

				const action = button.dataset.action;
				const productId = button.dataset.productId;

				if (action === 'cart') {
					await handleCart(button, productId);
					return;
				}

				if (action === 'wishlist') {
					await handleWishlist(button, productId);
				}
			});
		}

		document.addEventListener('gg-session-changed', async function () {
			await syncWishlistIds();
		});

		return {
			render,
			showAlert(message, type = 'success') {
				showAlert(alertHost, message, type);
			},
			syncWishlistIds,
		};
	}

	window.GadgetGroveProductCards = { createCatalogController };
})();