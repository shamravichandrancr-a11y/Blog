const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getBlogs, getBlogById, createBlog, updateBlog, deleteBlog,
  toggleLike, toggleBookmark, getMyBlogs, getMyBookmarks,
  getTrending, getStats, uploadImage
} = require('../controllers/blogController');

router.get('/', optionalAuth, getBlogs);
router.get('/trending', getTrending);
router.get('/my', protect, getMyBlogs);
router.get('/bookmarks', protect, getMyBookmarks);
router.get('/stats', protect, getStats);
router.get('/:id', optionalAuth, getBlogById);
router.post('/', protect, upload.single('coverImage'), createBlog);
router.put('/:id', protect, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/upload-image', protect, upload.single('image'), uploadImage);

module.exports = router;
