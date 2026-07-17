const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 9 } = req.query;
    const query = {};

    if (!req.user || req.user.role !== 'admin') {
      query.published = true;
    }

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('getBlogs error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const related = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      published: true
    }).limit(3).sort({ createdAt: -1 });
    res.json({ blog, related });
  } catch (error) {
    console.error('getBlogBySlug error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error('getBlogById error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    console.error('createBlog error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.error('updateBlog error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    console.error('deleteBlog error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog };
