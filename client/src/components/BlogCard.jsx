import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiBookmark, HiEye, HiClock } from 'react-icons/hi';
import { timeAgo, stripHtml, truncate, getAvatarUrl } from '../utils';

export default function BlogCard({ blog, index = 0 }) {
  const isLiked = false;
  const isBookmarked = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      className="group neo-card overflow-hidden hover-lift cursor-pointer relative"
    >
      {/* Chrome shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]" />

      <Link to={`/blog/${blog._id}`}>
        {/* Cover Image */}
        {blog.coverImage && (
          <div className="relative overflow-hidden h-48">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />
            <span className="absolute top-3 left-3 glass px-3 py-1 rounded-full text-xs font-medium text-zinc-300 border border-white/10">
              {blog.category}
            </span>
          </div>
        )}

        <div className="p-5">
          {/* Category badge (if no image) */}
          {!blog.coverImage && (
            <span className="glass px-3 py-1 rounded-full text-xs font-medium text-zinc-400 border border-white/08 mb-3 inline-block">
              {blog.category}
            </span>
          )}

          {/* Title */}
          <h2 className="font-clash font-semibold text-[1.15rem] leading-snug text-white mb-2 line-clamp-2 group-hover:text-zinc-200 transition-colors">
            {blog.title}
          </h2>

          {/* Subtitle / Excerpt */}
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {blog.subtitle || truncate(stripHtml(blog.content), 120)}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src={getAvatarUrl(blog.author)}
              alt={blog.author?.name}
              className="w-7 h-7 rounded-full object-cover border border-white/10"
            />
            <div>
              <p className="text-xs font-medium text-zinc-300">{blog.author?.name}</p>
              <p className="text-xs text-zinc-600">{timeAgo(blog.createdAt)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/05 text-xs text-zinc-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <HiEye size={13} />
                {blog.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <HiHeart size={13} className={isLiked ? 'text-red-400' : ''} />
                {blog.likes?.length || 0}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <HiClock size={13} />
              {blog.readingTime || 1} min read
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
