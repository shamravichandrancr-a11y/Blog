const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId, parentComment: null })
      .populate('author', 'name avatar')
      .populate({ path: 'replies', populate: { path: 'author', select: 'name avatar' } })
      .sort('-createdAt');
    res.json({ success: true, comments });
  } catch (err) { next(err); }
};

exports.createComment = async (req, res, next) => {
  try {
    const { content, blogId, parentComment } = req.body;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const comment = await Comment.create({ blog: blogId, author: req.user.id, content, parentComment: parentComment || null });
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }
    await comment.populate('author', 'name avatar');
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', 'name avatar');
    res.json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: comment._id } });
    }
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};

exports.toggleCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const idx = comment.likes.indexOf(req.user.id);
    if (idx > -1) comment.likes.splice(idx, 1);
    else comment.likes.push(req.user.id);
    await comment.save({ validateBeforeSave: false });
    res.json({ success: true, liked: idx === -1, likeCount: comment.likes.length });
  } catch (err) { next(err); }
};
