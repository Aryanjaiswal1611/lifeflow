const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true, maxlength: 300 },
  category: {
    type: String,
    required: true,
    enum: ['Blood Donation', 'Health Tips', 'Nutrition', 'Medical News', 'Awareness', 'Success Stories', 'Blood Camps', 'Emergency Care']
  },
  coverImage: { type: String, default: '' },
  author: { type: String, required: true },
  tags: [{ type: String }],
  readingTime: { type: Number, default: 5 },
  published: { type: Boolean, default: false }
}, { timestamps: true });

blogSchema.index({ category: 1, published: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
