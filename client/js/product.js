// Fetch and render all products on the products page

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.querySelector('.products-grid');
  if (!productsGrid) return;

  try {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    productsGrid.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <a href="product-details.html?id=${product.id}">
          <img src="${product.image_url}" alt="${product.name}" />
          <h3>${product.name}</h3>
        </a>
        <p>${product.description}</p>
        <p class="price">₹${Number(product.price).toLocaleString('en-IN')}</p>
      `;
      productsGrid.appendChild(card);
    });
  } catch (err) {
    productsGrid.innerHTML = '<p>Failed to load products.</p>';
  }
});
