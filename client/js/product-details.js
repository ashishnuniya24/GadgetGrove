document.addEventListener('DOMContentLoaded', async function () {
  const api = window.GadgetGroveAPI;
  const detailsDiv = document.getElementById('product-details');
  const commentList = document.getElementById('commentList');
  const commentForm = document.getElementById('commentForm');
  const commentContent = document.getElementById('commentContent');
  const commentAlert = document.getElementById('commentAlert');
  const commentSubmitBtn = document.getElementById('commentSubmitBtn');
  const commentCancelBtn = document.getElementById('commentCancelBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackAlert = document.getElementById('feedbackAlert');
  const productId = new URLSearchParams(window.location.search).get('id');
  let editingCommentId = null;

  function showAlert(host, message, type = 'danger') {
    host.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
  }

  function showCommentAlert(message, type = 'danger') {
    showAlert(commentAlert, message, type);
  }

  function showFeedbackAlert(message, type = 'danger') {
    showAlert(feedbackAlert, message, type);
  }

  function resetCommentForm() {
    editingCommentId = null;
    commentContent.value = '';
    commentSubmitBtn.textContent = 'Post Comment';
    commentCancelBtn.classList.add('d-none');
  }

  function requireLogin(message, alertFn) {
    if (api.isAuthenticated()) {
      return true;
    }

    alertFn(message, 'warning');
    return false;
  }

  function renderComments(comments) {
    if (!comments.length) {
      commentList.innerHTML = '<div class="empty-state">No comments yet. Be the first to share your thoughts.</div>';
      return;
    }

    commentList.innerHTML = comments.map(function (comment) {
      const dateText = new Date(comment.updated_at || comment.created_at).toLocaleString();
      const likeButtonClass = comment.liked_by_user ? 'btn-primary' : 'btn-outline-primary';
      const editButton = comment.is_owner
        ? `<button class="btn btn-sm btn-outline-secondary" data-comment-action="edit" data-comment-id="${comment.id}" type="button">Edit</button>`
        : '';
      const deleteButton = comment.is_owner
        ? `<button class="btn btn-sm btn-outline-danger" data-comment-action="delete" data-comment-id="${comment.id}" type="button">Delete</button>`
        : '';

      return `
        <article class="comment-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h3 class="h6 mb-1">${comment.user_name}</h3>
                <p class="comment-meta mb-0">${dateText}</p>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-sm ${likeButtonClass}" data-comment-action="like" data-comment-id="${comment.id}" type="button">Like (${Number(comment.like_count)})</button>
                ${editButton}
                ${deleteButton}
              </div>
            </div>
            <p class="mb-0 text-secondary">${comment.content}</p>
          </div>
        </article>
      `;
    }).join('');
  }

  async function loadComments() {
    try {
      const data = await api.getComments(productId);
      renderComments(data.comments || []);
    } catch (error) {
      showCommentAlert(error.message || 'Failed to load comments.');
      commentList.innerHTML = '<div class="empty-state">Unable to load comments right now.</div>';
    }
  }

  async function fillCommentForEdit(commentId) {
    const data = await api.getComments(productId);
    const targetComment = (data.comments || []).find(function (comment) {
      return comment.id === commentId;
    });

    if (!targetComment) {
      showCommentAlert('Comment not found.');
      return;
    }

    editingCommentId = commentId;
    commentContent.value = targetComment.content;
    commentSubmitBtn.textContent = 'Update Comment';
    commentCancelBtn.classList.remove('d-none');
    commentContent.focus();
  }

  if (!productId) {
    detailsDiv.innerHTML = '<div class="alert alert-warning">Product not found.</div>';
    return;
  }

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
              <p class="price mb-4">${api.formatCurrency(product.price)}</p>
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

    const productAlertHost = detailsDiv.querySelector('#product-action-alert');

    detailsDiv.addEventListener('click', async function (event) {
      const button = event.target.closest('[data-action]');
      if (!button) {
        return;
      }

      if (!api.isAuthenticated()) {
        showAlert(productAlertHost, 'Please login to continue.', 'warning');
        window.setTimeout(function () {
          window.location.href = 'login.html';
        }, 900);
        return;
      }

      try {
        if (button.dataset.action === 'cart') {
          await api.addToCart(product.id, 1);
          showAlert(productAlertHost, 'Product added to cart.', 'success');
        }

        if (button.dataset.action === 'wishlist') {
          await api.addToWishlist(product.id);
          showAlert(productAlertHost, 'Product saved to wishlist.', 'success');
        }
      } catch (error) {
        showAlert(productAlertHost, error.message || 'Action failed.', 'danger');
      }
    });

    await loadComments();
  } catch {
    detailsDiv.innerHTML = '<div class="alert alert-danger">Failed to load product details.</div>';
  }

  commentForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!requireLogin('Please login to post or edit comments.', showCommentAlert)) {
      return;
    }

    const content = commentContent.value.trim();
    if (!content) {
      showCommentAlert('Comment cannot be empty.', 'warning');
      return;
    }

    try {
      const data = editingCommentId
        ? await api.updateComment(productId, editingCommentId, content)
        : await api.addComment(productId, content);

      renderComments(data.comments || []);
      showCommentAlert(editingCommentId ? 'Comment updated.' : 'Comment posted.', 'success');
      resetCommentForm();
    } catch (error) {
      showCommentAlert(error.message || 'Failed to save comment.');
    }
  });

  commentCancelBtn.addEventListener('click', function () {
    resetCommentForm();
  });

  commentList.addEventListener('click', async function (event) {
    const button = event.target.closest('[data-comment-action]');
    if (!button) {
      return;
    }

    if (!requireLogin('Please login to interact with comments.', showCommentAlert)) {
      return;
    }

    const action = button.dataset.commentAction;
    const commentId = button.dataset.commentId;

    try {
      if (action === 'like') {
        const data = await api.toggleCommentLike(productId, commentId);
        renderComments(data.comments || []);
        return;
      }

      if (action === 'edit') {
        await fillCommentForEdit(commentId);
        return;
      }

      if (action === 'delete') {
        const data = await api.deleteComment(productId, commentId);
        renderComments(data.comments || []);
        showCommentAlert('Comment deleted.', 'success');

        if (editingCommentId === commentId) {
          resetCommentForm();
        }
      }
    } catch (error) {
      showCommentAlert(error.message || 'Comment action failed.');
    }
  });

  feedbackForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!requireLogin('Please login to submit feedback.', showFeedbackAlert)) {
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
