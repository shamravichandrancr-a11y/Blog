import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '../services';
import BlogCard from '../components/BlogCard';
import SkeletonGrid from '../components/Skeleton';
import { HiSearch, HiFilter } from 'react-icons/hi';
import { categories } from '../utils';

const sortOptions = [
  { value: '-createdAt', label: 'Latest' },
  { value: '-views', label: 'Most Viewed' },
  { value: '-likes', label: 'Most Liked' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');

  const fetchBlogs = async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true);
    try {
      const params = { page: pg, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await blogService.getBlogs(params);
      if (append) setBlogs(prev => [...prev, ...data.blogs]);
      else setBlogs(data.blogs);
      setTotal(data.total);
      setHasMore(pg < data.pages);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(1); }, [search, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(1);
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="font-clash font-bold text-4xl md:text-5xl text-white mb-3">Explore Stories</h1>
          <p className="text-zinc-500">Discover ideas worth sharing</p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="neo-card p-5 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stories, authors, tags..."
                className="neo-input pl-11 pr-4 py-3 text-sm"
              />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" className="neo-button-primary neo-button px-6 py-3 text-sm font-semibold">
              Search
            </motion.button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 mr-2">
              <HiFilter size={13} /> Filter:
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory('')}
                className={`neo-button px-3 py-1.5 text-xs ${!category ? 'border-white/20 text-white' : 'text-zinc-500'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat === category ? '' : cat)}
                  className={`neo-button px-3 py-1.5 text-xs transition-all ${category === cat ? 'border-white/20 text-white' : 'text-zinc-500'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="neo-input px-3 py-1.5 text-xs w-auto cursor-pointer">
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#161616]">{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        {!loading && (
          <p className="text-zinc-600 text-sm mb-6">
            {total} {total === 1 ? 'story' : 'stories'} found
            {search && <span> for "<span className="text-zinc-400">{search}</span>"</span>}
          </p>
        )}

        {/* Blog Grid */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : blogs.length === 0 ? (
          <div className="neo-card p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-clash text-xl text-white mb-2">No results found</h3>
            <p className="text-zinc-600 text-sm">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="mt-10 flex justify-center">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => fetchBlogs(page + 1, true)}
              className="neo-button px-8 py-3 text-sm font-medium text-zinc-300">
              Load More
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
