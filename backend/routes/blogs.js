const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.get('/id/:id', protect, authorize('admin'), getBlogById);
router.post('/', protect, authorize('admin'), createBlog);
router.put('/:id', protect, authorize('admin'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
