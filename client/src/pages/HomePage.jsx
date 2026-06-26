import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { blogService } from '../services';
import BlogCard from '../components/BlogCard';
import SkeletonGrid, { BlogCardSkeleton } from '../components/Skeleton';
import { HiArrowRight, HiTrendingUp, HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { categories } from '../utils';

const categoryIcons = ['💻', '🎨', '💼', '🔬', '🎭', '❤️', '✈️', '🍕', '⚽', '🎬', '🏛️', '📚', '🌐'];

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoad, setTrendingLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const fetchBlogs = useCallback(async (pg = 1, category = '', append = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = { page: pg, limit: 9, sort: '-createdAt' };
      if (category) params.category = category;
      const { data } = await blogService.getBlogs(params);
      if (append) setBlogs(prev => [...prev, ...data.blogs]);
      else setBlogs(data.blogs);
      setHasMore(pg < data.pages);
      setPage(pg);
    } catch {} finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await blogService.getTrending();
      setTrending(data.blogs);
    } catch {} finally { setTrendingLoad(false); }
  }, []);

  useEffect(() => {
    fetchBlogs(1, selectedCategory);
    fetchTrending();
  }, [selectedCategory]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchBlogs(page + 1, selectedCategory, true);
    }, { threshold: 0.1 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section style={{ y: heroY, opacity: heroOpacity }} className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-32 pb-16">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium text-zinc-400 border border-white/10 mb-8"
          >
            <HiSparkles size={12} className="text-zinc-300" />
            The Premium Writing Platform
          </motion.span>

          <h1 className="font-clash font-bold text-[clamp(3rem,9vw,7rem)] leading-[0.95] tracking-tight mb-6 text-balance">
            <motion.span className="block chrome-text" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
              Where Stories
            </motion.span>
            <motion.span className="block text-white" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.8 }}>
              Come Alive
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-zinc-500 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Publish your ideas with elegance. Read the world's finest writers. Join a community of creators.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/write" className="neo-button-primary neo-button px-7 py-3.5 text-sm font-semibold flex items-center gap-2">
              Start Writing <HiArrowRight size={16} />
            </Link>
            <Link to="/explore" className="neo-button px-7 py-3.5 text-sm font-medium text-zinc-300">
              Explore Stories
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-zinc-700" />
        </motion.div>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4">
        {/* Trending Section */}
        {trending.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 neo-card flex items-center justify-center rounded-xl">
                  <HiTrendingUp size={16} className="text-zinc-300" />
                </div>
                <h2 className="font-clash font-bold text-2xl text-white">Trending</h2>
              </div>
              <Link to="/explore?sort=-views" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                See all <HiArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendingLoad
                ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
                : trending.slice(0, 3).map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)
              }
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 neo-card flex items-center justify-center rounded-xl">
              <HiLightningBolt size={16} className="text-zinc-300" />
            </div>
            <h2 className="font-clash font-bold text-2xl text-white">Categories</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`neo-button px-4 py-2 text-sm font-medium transition-all ${selectedCategory === '' ? 'neo-button-primary text-black' : 'text-zinc-400'}`}
            >
              All
            </button>
            {categories.map((cat, i) => (
              <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`neo-button px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${selectedCategory === cat ? 'border-white/20 text-white' : 'text-zinc-500'}`}
              >
                <span>{categoryIcons[i]}</span>
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Latest Blogs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-clash font-bold text-2xl text-white">
              {selectedCategory || 'Latest'} Stories
            </h2>
          </div>

          {loading ? (
            <SkeletonGrid count={9} />
          ) : blogs.length === 0 ? (
            <div className="neo-card p-16 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-clash text-xl text-white mb-2">No stories yet</h3>
              <p className="text-zinc-600 text-sm">Be the first to share in this category</p>
              <Link to="/write" className="neo-button-primary neo-button px-6 py-3 text-sm font-semibold inline-flex mt-5">
                Write a Story
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i % 9} />)}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-3 text-zinc-500 text-sm">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                    Loading more stories...
                  </div>
                )}
                {!hasMore && blogs.length > 0 && (
                  <p className="text-zinc-700 text-sm">You've reached the end</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
