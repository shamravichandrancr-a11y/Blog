import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService, blogService } from '../services';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { getAvatarUrl, formatDate } from '../utils';
import toast from 'react-hot-toast';

export default function AuthorPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, blogsRes] = await Promise.all([
          authService.getUserById(id),
          blogService.getBlogs({ author: id, status: 'published', limit: 20 }),
        ]);
        setAuthor(userRes.data.user);
        setBlogs(blogsRes.data.blogs);
        setFollowing(user?.following?.includes(id));
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleFollow = async () => {
    if (!isAuthenticated) return toast.error('Login to follow');
    try {
      const { data } = await authService.followUser(id);
      setFollowing(data.isFollowing);
      setAuthor(prev => ({
        ...prev,
        followers: data.isFollowing
          ? [...(prev.followers || []), user._id]
          : (prev.followers || []).filter(f => f !== user._id)
      }));
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="pt-28 max-w-5xl mx-auto px-4">
      <div className="neo-card p-8 mb-8 space-y-4">
        <div className="flex gap-5">
          <div className="skeleton w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-72" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!author) return <div className="pt-28 text-center text-zinc-600">Author not found</div>;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Author Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neo-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img src={getAvatarUrl(author)} alt={author.name} className="w-20 h-20 rounded-full object-cover border-2 border-white/15" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-clash font-bold text-2xl text-white">{author.name}</h1>
                  {author.bio && <p className="text-zinc-500 text-sm mt-2 max-w-md leading-relaxed">{author.bio}</p>}
                  {author.website && <a href={author.website} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-400 mt-1 block underline">{author.website}</a>}
                  <div className="flex items-center gap-5 mt-4 text-sm">
                    <div><span className="font-bold text-white">{blogs.length}</span><span className="text-zinc-600 ml-1.5">Posts</span></div>
                    <div><span className="font-bold text-white">{author.followers?.length || 0}</span><span className="text-zinc-600 ml-1.5">Followers</span></div>
                    <div><span className="font-bold text-white">{author.following?.length || 0}</span><span className="text-zinc-600 ml-1.5">Following</span></div>
                  </div>
                </div>
                {user?._id !== id && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleFollow}
                    className={`neo-button px-5 py-2.5 text-sm font-medium ${following ? 'text-zinc-400' : 'neo-button-primary text-black'}`}>
                    {following ? 'Following' : 'Follow'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Author's Blogs */}
        <h2 className="font-clash font-bold text-xl text-white mb-6">Stories by {author.name}</h2>
        {blogs.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-zinc-600 text-sm">No published stories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogs.map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
