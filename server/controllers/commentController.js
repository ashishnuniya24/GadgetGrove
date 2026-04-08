import Product from '../models/productModel.js';
import {
	addCommentLike,
	createComment,
	deleteComment,
	findCommentById,
	getCommentLikeCount,
	getCommentsByProductId,
	hasUserLikedComment,
	removeCommentLike,
	updateComment,
} from '../models/commentModel.js';

const shapeComments = async (productId, userId) => {
	const comments = await getCommentsByProductId(productId, userId);
	return comments.map((comment) => ({
		...comment,
		is_owner: userId ? comment.user_id === userId : false,
	}));
};

export const getComments = async (req, res) => {
	try {
		const product = await Product.getById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		const userId = req.headers.authorization ? req.user?.id || null : null;
		const comments = await shapeComments(req.params.id, userId);
		res.json({ comments, count: comments.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to load comments.', error: error.message });
	}
};

export const addComment = async (req, res) => {
	try {
		const { content } = req.body;
		if (!content || !content.trim()) {
			return res.status(400).json({ message: 'Comment content is required.' });
		}

		const product = await Product.getById(req.params.id);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		await createComment({ productId: req.params.id, userId: req.user.id, content: content.trim() });
		const comments = await shapeComments(req.params.id, req.user.id);
		res.status(201).json({ message: 'Comment added.', comments, count: comments.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to add comment.', error: error.message });
	}
};

export const editComment = async (req, res) => {
	try {
		const { content } = req.body;
		if (!content || !content.trim()) {
			return res.status(400).json({ message: 'Comment content is required.' });
		}

		const comment = await findCommentById(req.params.commentId);
		if (!comment || comment.product_id !== req.params.id) {
			return res.status(404).json({ message: 'Comment not found.' });
		}

		const updated = await updateComment({ commentId: req.params.commentId, userId: req.user.id, content: content.trim() });
		if (!updated) {
			return res.status(403).json({ message: 'You can only edit your own comments.' });
		}

		const comments = await shapeComments(req.params.id, req.user.id);
		res.json({ message: 'Comment updated.', comments, count: comments.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to update comment.', error: error.message });
	}
};

export const removeComment = async (req, res) => {
	try {
		const comment = await findCommentById(req.params.commentId);
		if (!comment || comment.product_id !== req.params.id) {
			return res.status(404).json({ message: 'Comment not found.' });
		}

		const deleted = await deleteComment({ commentId: req.params.commentId, userId: req.user.id });
		if (!deleted) {
			return res.status(403).json({ message: 'You can only delete your own comments.' });
		}

		const comments = await shapeComments(req.params.id, req.user.id);
		res.json({ message: 'Comment deleted.', comments, count: comments.length });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete comment.', error: error.message });
	}
};

export const toggleLikeComment = async (req, res) => {
	try {
		const comment = await findCommentById(req.params.commentId);
		if (!comment || comment.product_id !== req.params.id) {
			return res.status(404).json({ message: 'Comment not found.' });
		}

		const liked = await hasUserLikedComment({ commentId: req.params.commentId, userId: req.user.id });
		if (liked) {
			await removeCommentLike({ commentId: req.params.commentId, userId: req.user.id });
		} else {
			await addCommentLike({ commentId: req.params.commentId, userId: req.user.id });
		}

		const likeCount = await getCommentLikeCount(req.params.commentId);
		const comments = await shapeComments(req.params.id, req.user.id);
		res.json({
			message: liked ? 'Like removed.' : 'Comment liked.',
			liked: !liked,
			likeCount,
			comments,
			count: comments.length,
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to toggle comment like.', error: error.message });
	}
};