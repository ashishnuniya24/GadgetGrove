document.addEventListener('DOMContentLoaded', async function () {
  const api = window.GadgetGroveAPI;
  const productCards = window.GadgetGroveProductCards;
  const productsGrid = document.querySelector('.products-grid');
  const alertHost = document.getElementById('catalogAlert');

  if (!productsGrid) {
    return;
  }

  const catalog = await productCards?.createCatalogController({
    grid: productsGrid,
    alertHost,
    emptyMessage: 'No products are available right now.',
  });

  try {
    const products = await api.request('/products');
    catalog?.render(products);
  } catch {
    productsGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger mb-0">Failed to load products.</div></div>';
  }
});
