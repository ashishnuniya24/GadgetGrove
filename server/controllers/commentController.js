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

const sendServerError = (res, message, error) => {
	res.status(500).json({ message, error: error.message });
};

const getProductOrNull = (productId) => Product.getById(productId);

const isMissingContent = (content) => !content || !content.trim();

const shapeComments = async (productId, userId) => {
	const comments = await getCommentsByProductId(productId, userId);
	return comments.map((comment) => ({
		...comment,
		is_owner: userId ? comment.user_id === userId : false,
	}));
};

const getCommentsResponse = async (productId, userId) => {
	const comments = await shapeComments(productId, userId);
	return { comments, count: comments.length };
};

export const getComments = async (req, res) => {
	try {
		const product = await getProductOrNull(req.params.id);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		const userId = req.headers.authorization ? req.user?.id || null : null;
		res.json(await getCommentsResponse(req.params.id, userId));
	} catch (error) {
		sendServerError(res, 'Failed to load comments.', error);
	}
};

export const addComment = async (req, res) => {
	try {
		const { content } = req.body;
		if (isMissingContent(content)) {
			return res.status(400).json({ message: 'Comment content is required.' });
		}

		const product = await getProductOrNull(req.params.id);
		if (!product) {
			return res.status(404).json({ message: 'Product not found.' });
		}

		await createComment({ productId: req.params.id, userId: req.user.id, content: content.trim() });
		res.status(201).json({ message: 'Comment added.', ...(await getCommentsResponse(req.params.id, req.user.id)) });
	} catch (error) {
		sendServerError(res, 'Failed to add comment.', error);
	}
};

export const editComment = async (req, res) => {
	try {
		const { content } = req.body;
		if (isMissingContent(content)) {
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

		res.json({ message: 'Comment updated.', ...(await getCommentsResponse(req.params.id, req.user.id)) });
	} catch (error) {
		sendServerError(res, 'Failed to update comment.', error);
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

		res.json({ message: 'Comment deleted.', ...(await getCommentsResponse(req.params.id, req.user.id)) });
	} catch (error) {
		sendServerError(res, 'Failed to delete comment.', error);
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
		const commentData = await getCommentsResponse(req.params.id, req.user.id);
		res.json({
			message: liked ? 'Like removed.' : 'Comment liked.',
			liked: !liked,
			likeCount,
			...commentData,
		});
	} catch (error) {
		sendServerError(res, 'Failed to toggle comment like.', error);
	}
};