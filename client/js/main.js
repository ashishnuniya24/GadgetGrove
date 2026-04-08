document.addEventListener('DOMContentLoaded', async function () {
  const api = window.GadgetGroveAPI;
  const productCards = window.GadgetGroveProductCards;
  const productsGrid = document.querySelector('.products-grid');
  const alertHost = document.getElementById('catalogAlert');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  let products = [];

  if (!productsGrid) {
    return;
  }

  const catalog = await productCards?.createCatalogController({
    grid: productsGrid,
    alertHost,
    emptyMessage: 'No products matched your search.',
  });

  function renderLoadError() {
    productsGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger mb-0">Failed to load products.</div></div>';
  }

  function searchProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const filteredProducts = products.filter(function (product) {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });

    catalog?.render(filteredProducts);
  }

  try {
    products = await api.request('/products');
    catalog?.render(products);
  } catch {
    renderLoadError();
  }

  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        searchProducts();
      }
    });
  }
});
