import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { blogService } from '../services';
import { useAuth } from '../context/AuthContext';
import ReadingProgress from '../components/ReadingProgress';
import CommentSection from '../components/CommentSection';
import { formatDate, getAvatarUrl, timeAgo } from '../utils';
import {
  HiHeart, HiBookmark, HiShare, HiClock, HiEye, HiArrowLeft, HiPencil, HiTrash,
  HiLink, HiCheck
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [toc, setToc] = useState([]);
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await blogService.getBlogById(id);
        setBlog(data.blog);
        setLiked(data.blog.likes?.includes(user?._id));
        setLikeCount(data.blog.likes?.length || 0);
        setBookmarked(user?.bookmarks?.includes(data.blog._id));
      } catch { navigate('/404'); } finally { setLoading(false); }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  // Build Table of Contents
  useEffect(() => {
    if (!blog?.content) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
    setToc(headings.map((h, i) => ({
      id: `heading-${i}`,
      text: h.textContent,
      level: parseInt(h.tagName[1]),
    })));
  }, [blog]);

  // Attach IDs to headings in rendered content
  useEffect(() => {
    if (!contentRef.current || !toc.length) return;
    const headings = contentRef.current.querySelectorAll('h1, h2, h3');
    headings.forEach((h, i) => { h.id = `heading-${i}`; });
  }, [blog, toc]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Login to like');
    try {
      const { data } = await blogService.toggleLike(blog._id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return toast.error('Login to bookmark');
    try {
      const { data } = await blogService.toggleBookmark(blog._id);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Bookmarked' : 'Removed from bookmarks');
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try { await navigator.share({ title: blog.title, url }); } catch {}
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await blogService.deleteBlog(blog._id);
      toast.success('Blog deleted');
      navigate('/dashboard');
    } catch { toast.error('Failed to delete'); }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return toast.error('Login to follow');
    try {
      const { authService } = await import('../services');
      const { data } = await authService.followUser(blog.author._id);
      setFollowing(data.isFollowing);
      toast.success(data.isFollowing ? 'Following' : 'Unfollowed');
    } catch {}
  };

  if (loading) return (
    <div className="pt-28 pb-16 max-w-3xl mx-auto px-4">
      <div className="space-y-4 mb-8">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-4/5" />
        <div className="skeleton h-64 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );

  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id;

  return (
    <>
      <ReadingProgress />
      <div className="pt-28 pb-16">
        {/* Back button */}
        <div className="max-w-5xl mx-auto px-4 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors neo-button px-4 py-2">
            <HiArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 flex gap-8">
          {/* Sticky Sidebar TOC */}
          {toc.length > 2 && (
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28">
                <div className="neo-card p-5">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Contents</h4>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a key={item.id} href={`#${item.id}`}
                        className={`block text-xs text-zinc-500 hover:text-zinc-300 transition-colors leading-relaxed py-0.5 border-l-2 border-transparent hover:border-zinc-600 ${item.level > 1 ? 'pl-3' : 'pl-2'}`}>
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="glass px-3 py-1 rounded-full text-xs font-medium text-zinc-300 border border-white/10">
                {blog.category}
              </span>
              {blog.tags?.map(tag => (
                <span key={tag} className="text-xs text-zinc-600">#{tag}</span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-clash font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4">
              {blog.title}
            </h1>
            {blog.subtitle && (
              <p className="text-lg md:text-xl text-zinc-500 leading-relaxed mb-8">{blog.subtitle}</p>
            )}

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-white/08 mb-8">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${blog.author?._id}`}>
                  <img src={getAvatarUrl(blog.author)} alt={blog.author?.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/15" />
                </Link>
                <div>
                  <Link to={`/profile/${blog.author?._id}`} className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors">
                    {blog.author?.name}
                  </Link>
                  <p className="text-xs text-zinc-600">{formatDate(blog.createdAt)}</p>
                </div>
                {!isAuthor && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleFollow}
                    className={`ml-2 neo-button px-3 py-1.5 text-xs font-medium ${following ? 'text-zinc-400' : 'text-white'}`}>
                    {following ? 'Following' : 'Follow'}
                  </motion.button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-1"><HiClock size={13} /> {blog.readingTime} min</span>
                <span className="flex items-center gap-1"><HiEye size={13} /> {blog.views?.toLocaleString()}</span>
                {isAuthor && (
                  <div className="flex items-center gap-2 ml-2">
                    <Link to={`/write/${blog._id}`} className="neo-button p-2 rounded-lg text-zinc-400 hover:text-white">
                      <HiPencil size={15} />
                    </Link>
                    <button onClick={handleDelete} className="neo-button p-2 rounded-lg text-zinc-600 hover:text-red-400">
                      <HiTrash size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {blog.coverImage && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                className="rounded-2xl overflow-hidden mb-10 aspect-video">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
              </motion.div>
            )}

            {/* Blog Content */}
            <motion.div ref={contentRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Action Bar */}
            <div className="sticky bottom-8 flex justify-center mt-12">
              <div className="glass-strong rounded-full px-6 py-3 flex items-center gap-5"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                  onClick={handleLike}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-400' : 'text-zinc-500 hover:text-white'}`}>
                  <HiHeart size={20} className={liked ? 'fill-red-400' : ''} />
                  {likeCount}
                </motion.button>

                <div className="w-px h-4 bg-white/10" />

                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                  onClick={handleBookmark}
                  className={`transition-colors ${bookmarked ? 'text-zinc-300' : 'text-zinc-600 hover:text-white'}`}>
                  <HiBookmark size={20} className={bookmarked ? 'fill-zinc-300' : ''} />
                </motion.button>

                <div className="w-px h-4 bg-white/10" />

                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                  onClick={handleShare}
                  className="text-zinc-500 hover:text-white transition-colors">
                  {copied ? <HiCheck size={20} className="text-green-400" /> : <HiShare size={20} />}
                </motion.button>
              </div>
            </div>

            {/* Comments */}
            <CommentSection blogId={blog._id} />
          </article>
        </div>
      </div>
    </>
  );
}
