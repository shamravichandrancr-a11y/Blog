const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

exports.getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, tag, author, search, sort = '-createdAt', status = 'published' } = req.query;
    const query = { status };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (author) query.author = author;
    if (search) query.$text = { $search: search };

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('author', 'name avatar bio')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / limit), blogs });
  } catch (err) { next(err); }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] })
      .populate('author', 'name avatar bio followers');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });
    res.json({ success: true, blog });
  } catch (err) { next(err); }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, subtitle, content, category, tags, status } = req.body;
    const blogData = {
      title, subtitle, content, category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      author: req.user.id,
      status: status || 'draft',
    };
    if (req.file) {
      blogData.coverImage = req.file.path;
      blogData.coverImagePublicId = req.file.filename;
    }
    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name avatar');
    res.status(201).json({ success: true, blog });
  } catch (err) { next(err); }
};

exports.updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updates = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
      updates.tags = req.body.tags.split(',').map(t => t.trim());
    }
    if (req.file) {
      if (blog.coverImagePublicId) await cloudinary.uploader.destroy(blog.coverImagePublicId);
      updates.coverImage = req.file.path;
      updates.coverImagePublicId = req.file.filename;
    }
    blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('author', 'name avatar');
    res.json({ success: true, blog });
  } catch (err) { next(err); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (blog.coverImagePublicId) await cloudinary.uploader.destroy(blog.coverImagePublicId);
    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) { next(err); }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const idx = blog.likes.indexOf(req.user.id);
    if (idx > -1) blog.likes.splice(idx, 1);
    else blog.likes.push(req.user.id);
    await blog.save({ validateBeforeSave: false });
    res.json({ success: true, liked: idx === -1, likeCount: blog.likes.length });
  } catch (err) { next(err); }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    const user = req.user;
    const idx = user.bookmarks.indexOf(req.params.id);
    if (idx > -1) {
      user.bookmarks.splice(idx, 1);
      blog.bookmarks.pull(req.user.id);
    } else {
      user.bookmarks.push(req.params.id);
      blog.bookmarks.push(req.user.id);
    }
    await user.save({ validateBeforeSave: false });
    await blog.save({ validateBeforeSave: false });
    res.json({ success: true, bookmarked: idx === -1 });
  } catch (err) { next(err); }
};

exports.getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user.id }).sort('-createdAt').populate('author', 'name avatar');
    res.json({ success: true, blogs });
  } catch (err) { next(err); }
};

exports.getMyBookmarks = async (req, res, next) => {
  try {
    const { bookmarks } = await req.user.populate({ path: 'bookmarks', populate: { path: 'author', select: 'name avatar' } });
    res.json({ success: true, blogs: bookmarks });
  } catch (err) { next(err); }
};

exports.getTrending = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name avatar')
      .sort('-views -likes')
      .limit(6);
    res.json({ success: true, blogs });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const authorId = req.user.id;
    const blogs = await Blog.find({ author: authorId });
    const totalViews = blogs.reduce((acc, b) => acc + b.views, 0);
    const totalLikes = blogs.reduce((acc, b) => acc + b.likes.length, 0);
    const totalBlogs = blogs.length;
    const publishedBlogs = blogs.filter(b => b.status === 'published').length;
    const drafts = blogs.filter(b => b.status === 'draft').length;
    const categories = {};
    blogs.forEach(b => { categories[b.category] = (categories[b.category] || 0) + 1; });
    const monthlyViews = {};
    blogs.forEach(b => {
      const month = new Date(b.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyViews[month] = (monthlyViews[month] || 0) + b.views;
    });
    res.json({ success: true, stats: { totalBlogs, publishedBlogs, drafts, totalViews, totalLikes, categories, monthlyViews } });
  } catch (err) { next(err); }
};

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, url: req.file.path, publicId: req.file.filename });
  } catch (err) { next(err); }
};
