import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { blogService } from '../services';
import { HiCamera, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getAvatarUrl, formatDate } from '../utils';
import BlogCard from '../components/BlogCard';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('blogs');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', website: user?.website || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [myBlogs, setMyBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await blogService.getMyBlogs();
        setMyBlogs(data.blogs);
      } catch {} finally { setBlogsLoading(false); }
    };
    load();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await authService.updateProfile(formData);
      updateUser(data.user);
      setEditing(false);
      setAvatarFile(null);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPass(true);
    try {
      await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setChangingPass(false); }
  };

  const avatar = avatarPreview || getAvatarUrl(user);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="neo-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img src={avatar} alt={user?.name} className="w-24 h-24 rounded-full object-cover border-2 border-white/15" />
              {editing && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer">
                  <HiCamera size={22} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="neo-input px-4 py-2.5 text-sm font-semibold w-full" placeholder="Your name" />
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    className="neo-input px-4 py-2.5 text-sm w-full resize-none" rows={3} placeholder="Your bio..." />
                  <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                    className="neo-input px-4 py-2.5 text-sm w-full" placeholder="Website URL" />
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSaveProfile} disabled={saving}
                      className="neo-button-primary neo-button px-4 py-2 text-sm flex items-center gap-1.5 disabled:opacity-60">
                      <HiCheck size={14} /> {saving ? 'Saving...' : 'Save'}
                    </motion.button>
                    <button onClick={() => setEditing(false)} className="neo-button px-4 py-2 text-sm text-zinc-400 flex items-center gap-1.5">
                      <HiX size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="font-clash font-bold text-2xl text-white">{user?.name}</h1>
                      <p className="text-sm text-zinc-600 mt-0.5">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 glass px-2 py-0.5 text-xs text-zinc-400 rounded-full border border-white/10">Admin</span>
                      )}
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing(true)} className="neo-button px-4 py-2 text-sm text-zinc-400 flex items-center gap-1.5">
                      <HiPencil size={14} /> Edit
                    </motion.button>
                  </div>
                  {user?.bio && <p className="text-sm text-zinc-400 mt-3 leading-relaxed max-w-lg">{user?.bio}</p>}
                  {user?.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 mt-2 block underline underline-offset-4">{user.website}</a>}
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="font-semibold text-white">{myBlogs.length}</span>
                      <span className="text-zinc-600 ml-1.5">Posts</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{user?.followers?.length || 0}</span>
                      <span className="text-zinc-600 ml-1.5">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{user?.following?.length || 0}</span>
                      <span className="text-zinc-600 ml-1.5">Following</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 mt-3">Member since {formatDate(user?.createdAt || new Date())}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['blogs', 'drafts', 'security'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`neo-button px-5 py-2.5 text-sm font-medium capitalize transition-all ${tab === t ? 'border-white/20 text-white' : 'text-zinc-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'blogs' && (
          <div>
            {blogsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
              </div>
            ) : myBlogs.filter(b => b.status === 'published').length === 0 ? (
              <div className="neo-card p-12 text-center">
                <div className="text-4xl mb-3">✍️</div>
                <p className="text-zinc-500 text-sm">No published stories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myBlogs.filter(b => b.status === 'published').map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'drafts' && (
          <div>
            {myBlogs.filter(b => b.status === 'draft').length === 0 ? (
              <div className="neo-card p-12 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-zinc-500 text-sm">No drafts saved</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myBlogs.filter(b => b.status === 'draft').map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
              </div>
            )}
          </div>
        )}

        {tab === 'security' && (
          <div className="max-w-md">
            <div className="neo-card p-6">
              <h3 className="font-clash font-semibold text-lg text-white mb-5">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wider block mb-2">Current Password</label>
                  <input type="password" value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="neo-input px-4 py-3 text-sm" placeholder="Current password" />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wider block mb-2">New Password</label>
                  <input type="password" value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="neo-input px-4 py-3 text-sm" placeholder="New password (min 6 chars)" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={changingPass}
                  className="neo-button-primary neo-button w-full py-3 text-sm font-semibold disabled:opacity-60">
                  {changingPass ? 'Changing...' : 'Change Password'}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
