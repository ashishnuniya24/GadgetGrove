// Fetch and render products on homepage

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.querySelector('.products-grid');
  const alertHost = document.getElementById('catalogAlert');
  if (!productsGrid) return;

  const catalog = await window.GadgetGroveProductCards?.createCatalogController({
    grid: productsGrid,
    alertHost,
    emptyMessage: 'No products matched your search.',
  });

  let products = [];

  try {
    const res = await fetch('http://localhost:5000/api/products');
    products = await res.json();
    catalog?.render(products);
  } catch (err) {
    productsGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger mb-0">Failed to load products.</div></div>';
  }

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
      catalog?.render(filtered);
    });
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

});
