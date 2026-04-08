document.addEventListener('DOMContentLoaded', async () => {
  const api = window.GadgetGroveAPI;
  const formatCurrency = (amount) => api.formatCurrency(amount);
  const detailsDiv = document.getElementById('product-details');
  const commentList = document.getElementById('commentList');
  const commentForm = document.getElementById('commentForm');
  const commentContent = document.getElementById('commentContent');
  const commentAlert = document.getElementById('commentAlert');
  const commentSubmitBtn = document.getElementById('commentSubmitBtn');
  const commentCancelBtn = document.getElementById('commentCancelBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackAlert = document.getElementById('feedbackAlert');
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  let editingCommentId = null;

  if (!productId) {
    detailsDiv.innerHTML = '<div class="alert alert-warning">Product not found.</div>';
    return;
  }

  const showCommentAlert = (message, type = 'danger') => {
    commentAlert.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
  };

  const showFeedbackAlert = (message, type = 'danger') => {
    feedbackAlert.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
  };

  const resetCommentForm = () => {
    editingCommentId = null;
    commentContent.value = '';
    commentSubmitBtn.textContent = 'Post Comment';
    commentCancelBtn.classList.add('d-none');
  };

  const renderComments = (comments) => {
    if (!comments.length) {
      commentList.innerHTML = '<div class="empty-state">No comments yet. Be the first to share your thoughts.</div>';
      return;
    }

    commentList.innerHTML = comments.map((comment) => `
      <article class="comment-card card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h3 class="h6 mb-1">${comment.user_name}</h3>
              <p class="comment-meta mb-0">${new Date(comment.updated_at || comment.created_at).toLocaleString()}</p>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <button class="btn btn-sm ${comment.liked_by_user ? 'btn-primary' : 'btn-outline-primary'}" data-comment-action="like" data-comment-id="${comment.id}" type="button">
                Like (${Number(comment.like_count)})
              </button>
              ${comment.is_owner ? `<button class="btn btn-sm btn-outline-secondary" data-comment-action="edit" data-comment-id="${comment.id}" type="button">Edit</button>` : ''}
              ${comment.is_owner ? `<button class="btn btn-sm btn-outline-danger" data-comment-action="delete" data-comment-id="${comment.id}" type="button">Delete</button>` : ''}
            </div>
          </div>
          <p class="mb-0 text-secondary">${comment.content}</p>
        </div>
      </article>
    `).join('');
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(productId);
      renderComments(data.comments || []);
    } catch (error) {
      showCommentAlert(error.message || 'Failed to load comments.');
      commentList.innerHTML = '<div class="empty-state">Unable to load comments right now.</div>';
    }
  };

  try {
    const product = await api.request(`/products/${productId}`);
    detailsDiv.innerHTML = `
      <article class="card detail-card border-0 overflow-hidden">
        <div class="row g-0">
          <div class="col-12 col-lg-5">
            <img src="${product.image_url}" alt="${product.name}" />
          </div>
          <div class="col-12 col-lg-7">
            <div class="card-body p-4 p-xl-5 h-100 d-flex flex-column">
              <h2 class="mb-3">${product.name}</h2>
              <p class="text-secondary mb-4">${product.description}</p>
              <p class="price mb-4">${formatCurrency(product.price)}</p>
              <div id="product-action-alert" class="mb-3"></div>
              <div class="mt-auto d-flex flex-column flex-sm-row gap-3">
                <button class="btn btn-primary btn-lg" type="button" data-action="cart">Add to Cart</button>
                <button class="btn btn-outline-secondary btn-lg" type="button" data-action="wishlist">Save to Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;

    const alertHost = detailsDiv.querySelector('#product-action-alert');
    const showAlert = (message, type = 'success') => {
      alertHost.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
    };

    detailsDiv.addEventListener('click', async (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) {
        return;
      }

      if (!api?.isAuthenticated()) {
        showAlert('Please login to continue.', 'warning');
        window.setTimeout(() => {
          window.location.href = 'login.html';
        }, 900);
        return;
      }

      try {
        if (action === 'cart') {
          await api.addToCart(product.id, 1);
          showAlert('Product added to cart.');
        }

        if (action === 'wishlist') {
          await api.addToWishlist(product.id);
          showAlert('Product saved to wishlist.');
        }
      } catch (error) {
        showAlert(error.message || 'Action failed.', 'danger');
      }
    });

    await loadComments();
  } catch (err) {
    detailsDiv.innerHTML = '<div class="alert alert-danger">Failed to load product details.</div>';
  }

  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!api.isAuthenticated()) {
      showCommentAlert('Please login to post or edit comments.', 'warning');
      return;
    }

    const content = commentContent.value.trim();
    if (!content) {
      showCommentAlert('Comment cannot be empty.', 'warning');
      return;
    }

    try {
      if (editingCommentId) {
        const data = await api.updateComment(productId, editingCommentId, content);
        renderComments(data.comments || []);
        showCommentAlert('Comment updated.', 'success');
      } else {
        const data = await api.addComment(productId, content);
        renderComments(data.comments || []);
        showCommentAlert('Comment posted.', 'success');
      }

      resetCommentForm();
    } catch (error) {
      showCommentAlert(error.message || 'Failed to save comment.');
    }
  });

  commentCancelBtn.addEventListener('click', () => {
    resetCommentForm();
  });

  commentList.addEventListener('click', async (event) => {
    const control = event.target.closest('[data-comment-action]');
    if (!control) {
      return;
    }

    const action = control.dataset.commentAction;
    const commentId = control.dataset.commentId;

    if (!api.isAuthenticated()) {
      showCommentAlert('Please login to interact with comments.', 'warning');
      return;
    }

    try {
      if (action === 'like') {
        const data = await api.toggleCommentLike(productId, commentId);
        renderComments(data.comments || []);
        return;
      }

      const data = await api.getComments(productId);
      const targetComment = (data.comments || []).find((comment) => comment.id === commentId);

      if (action === 'edit' && targetComment) {
        editingCommentId = commentId;
        commentContent.value = targetComment.content;
        commentSubmitBtn.textContent = 'Update Comment';
        commentCancelBtn.classList.remove('d-none');
        commentContent.focus();
      }

      if (action === 'delete') {
        const response = await api.deleteComment(productId, commentId);
        renderComments(response.comments || []);
        showCommentAlert('Comment deleted.', 'success');
        if (editingCommentId === commentId) {
          resetCommentForm();
        }
      }
    } catch (error) {
      showCommentAlert(error.message || 'Comment action failed.');
    }
  });

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!api.isAuthenticated()) {
      showFeedbackAlert('Please login to submit feedback.', 'warning');
      return;
    }

    const category = document.getElementById('feedbackCategory').value;
    const message = document.getElementById('feedbackMessage').value.trim();
    if (!message) {
      showFeedbackAlert('Feedback message cannot be empty.', 'warning');
      return;
    }

    try {
      await api.submitFeedback({ productId, category, message });
      showFeedbackAlert('Feedback submitted successfully.', 'success');
      feedbackForm.reset();
    } catch (error) {
      showFeedbackAlert(error.message || 'Failed to submit feedback.');
    }
  });
});
