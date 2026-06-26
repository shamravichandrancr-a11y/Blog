import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { blogService } from '../services';
import BlogCard from '../components/BlogCard';
import { HiBookmark } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function BookmarksPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await blogService.getMyBookmarks();
        setBlogs(data.blogs);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <HiBookmark size={24} className="text-zinc-400" />
            <h1 className="font-clash font-bold text-3xl text-white">Bookmarks</h1>
          </div>
          <p className="text-zinc-600 text-sm">Stories you've saved for later</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : blogs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-card p-16 text-center">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="font-clash text-xl text-white mb-2">No bookmarks yet</h3>
            <p className="text-zinc-600 text-sm mb-6">Save stories you love to read later</p>
            <Link to="/explore" className="neo-button-primary neo-button px-6 py-3 text-sm font-semibold inline-flex">
              Explore Stories
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
