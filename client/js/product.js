// Fetch and render all products on the products page

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.querySelector('.products-grid');
  const alertHost = document.getElementById('catalogAlert');
  if (!productsGrid) return;

  const catalog = await window.GadgetGroveProductCards?.createCatalogController({
    grid: productsGrid,
    alertHost,
    emptyMessage: 'No products are available right now.',
  });

  try {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    catalog?.render(products);
  } catch (err) {
    productsGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger mb-0">Failed to load products.</div></div>';
  }
});
