// Fetch and render product details on the product-details page

document.addEventListener('DOMContentLoaded', async () => {
  const detailsDiv = document.getElementById('product-details');
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    detailsDiv.innerHTML = '<p>Product not found.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/products/${productId}`);
    if (!res.ok) throw new Error('Not found');
    const product = await res.json();
    detailsDiv.innerHTML = `
      <div class="product-details">
        <img src="${product.image_url}" alt="${product.name}" />
        <div class="info">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p class="price">₹${Number(product.price).toLocaleString('en-IN')}</p>
        </div>
      </div>
    `;
  } catch (err) {
    detailsDiv.innerHTML = '<p>Failed to load product details.</p>';
  }
});
