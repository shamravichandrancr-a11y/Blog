import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService, blogService } from '../services';
import { HiUsers, HiDocumentText, HiTrash, HiShieldCheck, HiEye } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { formatDate, getAvatarUrl } from '../utils';
import toast from 'react-hot-toast';

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`neo-button px-5 py-2.5 text-sm font-medium flex items-center gap-2 ${active ? 'border-white/20 text-white' : 'text-zinc-500'}`}>
    <Icon size={15} />{label}
  </button>
);

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, blogsRes] = await Promise.all([
          authService.getAllUsers(),
          blogService.getBlogs({ limit: 50, sort: '-createdAt' }),
        ]);
        setUsers(usersRes.data.users);
        setBlogs(blogsRes.data.blogs);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await authService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await blogService.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b._id !== id));
      toast.success('Blog deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-8">
          <HiShieldCheck size={28} className="text-zinc-400" />
          <div>
            <h1 className="font-clash font-bold text-3xl text-white">Admin Panel</h1>
            <p className="text-zinc-600 text-sm">Manage platform content and users</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, icon: HiUsers },
            { label: 'Total Blogs', value: blogs.length, icon: HiDocumentText },
            { label: 'Published', value: blogs.filter(b => b.status === 'published').length, icon: HiEye },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: HiShieldCheck },
          ].map(({ label, value, icon: Icon }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="neo-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl neo-card flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-zinc-400" />
              </div>
              <div>
                <p className="font-clash font-bold text-xl text-white">{value}</p>
                <p className="text-xs text-zinc-600">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')} icon={HiUsers} label="Users" />
          <TabBtn active={tab === 'blogs'} onClick={() => setTab('blogs')} icon={HiDocumentText} label="Blogs" />
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-600 uppercase tracking-wider border-b border-white/06">
                    <th className="text-left px-5 py-4">User</th>
                    <th className="text-left px-4 py-4">Email</th>
                    <th className="text-left px-4 py-4">Role</th>
                    <th className="text-right px-4 py-4">Joined</th>
                    <th className="text-right px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-white/04 hover:bg-white/02 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={getAvatarUrl(u)} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                          <span className="font-medium text-zinc-300">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-zinc-600">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/05">
                            <HiTrash size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Blogs Tab */}
        {tab === 'blogs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-600 uppercase tracking-wider border-b border-white/06">
                    <th className="text-left px-5 py-4">Title</th>
                    <th className="text-left px-4 py-4">Author</th>
                    <th className="text-left px-4 py-4">Status</th>
                    <th className="text-right px-4 py-4">Views</th>
                    <th className="text-right px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog._id} className="border-b border-white/04 hover:bg-white/02 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/blog/${blog._id}`} className="text-zinc-300 hover:text-white transition-colors line-clamp-1 max-w-[220px] block">
                          {blog.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500">{blog.author?.name}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-zinc-600">{blog.views?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleDeleteBlog(blog._id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/05">
                          <HiTrash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
