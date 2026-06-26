const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subtitle: { type: String, trim: true, maxlength: 300 },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Technology', 'Design', 'Business', 'Science', 'Culture', 'Health', 'Travel', 'Food', 'Sports', 'Entertainment', 'Politics', 'Education', 'Other'] },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 1 },
  slug: { type: String, unique: true },
  featured: { type: Boolean, default: false },
  editorsPick: { type: Boolean, default: false },
}, { timestamps: true });

blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const text = this.content.replace(/<[^>]+>/g, '');
    const wpm = 200;
    this.readingTime = Math.max(1, Math.ceil(text.split(/\s+/).length / wpm));
  }
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

blogSchema.index({ title: 'text', tags: 'text' });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
