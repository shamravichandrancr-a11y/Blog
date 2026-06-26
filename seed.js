require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
const Blog = require('./server/models/Blog');
const Comment = require('./server/models/Comment');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB connected');
};

const categories = ['Technology', 'Design', 'Business', 'Culture', 'Health'];

const sampleContent = `<h2>Introduction</h2><p>This is a sample blog post for INKFLOW, the premium writing platform designed for modern storytellers and creators.</p><h2>The Vision</h2><p>INKFLOW reimagines what a blogging platform can be — not just a place to publish words, but a canvas for ideas, a stage for voices, and a community for thinkers.</p><blockquote><p>Great writing changes everything. It shifts perspectives, sparks movements, and leaves an indelible mark on the world.</p></blockquote><h2>Core Features</h2><ul><li>Rich text editing with TipTap</li><li>Immersive reading experience</li><li>Nested comments</li><li>Author analytics</li></ul><h2>Conclusion</h2><p>Welcome to the future of writing. Welcome to INKFLOW.</p>`;

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Comment.deleteMany({});

    const admin = await User.create({ name: 'Admin', email: 'admin@inkflow.io', password: 'Admin@123', role: 'admin', bio: 'Platform administrator and chief editor.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' });
    const users = await User.insertMany([
      { name: 'Alex Rivera', email: 'alex@inkflow.io', password: 'Pass@123', bio: 'Tech writer & developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
      { name: 'Maya Chen', email: 'maya@inkflow.io', password: 'Pass@123', bio: 'Design thinker & visual storyteller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya' },
      { name: 'Jordan Lee', email: 'jordan@inkflow.io', password: 'Pass@123', bio: 'Culture writer & essayist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan' },
    ]);

    const allUsers = [admin, ...users];
    const blogs = [];
    const titles = [
      'The Future of AI in Creative Writing', 'Designing for the Human Eye', 'Building a Business That Lasts',
      'The Culture of Remote Work', 'Mental Health in the Digital Age', 'Mastering TypeScript in 2025',
      'The Art of Minimal Design', 'Startup Lessons Nobody Tells You', 'Why Reading Books Still Matters', 'The Science of Deep Focus',
    ];

    for (let i = 0; i < 10; i++) {
      const blog = await Blog.create({
        title: titles[i],
        subtitle: `A deep dive into ${titles[i].toLowerCase()} — insights, perspectives, and actionable takeaways.`,
        content: sampleContent,
        category: categories[i % categories.length],
        tags: ['inkflow', 'writing', categories[i % categories.length].toLowerCase()],
        author: allUsers[i % allUsers.length]._id,
        status: 'published',
        views: Math.floor(Math.random() * 5000) + 100,
        likes: allUsers.slice(0, Math.floor(Math.random() * 3) + 1).map(u => u._id),
        featured: i < 2,
        editorsPick: i < 3,
      });
      blogs.push(blog);
    }

    await Comment.create({ blog: blogs[0]._id, author: users[0]._id, content: 'Absolutely brilliant article. The insights here changed how I think about this topic.' });
    await Comment.create({ blog: blogs[0]._id, author: users[1]._id, content: 'Could not agree more. Thank you for such a well-crafted piece.' });
    await Comment.create({ blog: blogs[1]._id, author: users[2]._id, content: 'This is exactly what I needed to read today.' });

    console.log('✅ Seed completed successfully');
    console.log('Admin: admin@inkflow.io / Admin@123');
    console.log('User: alex@inkflow.io / Pass@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
