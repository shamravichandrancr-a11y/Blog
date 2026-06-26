import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService } from '../services';
import Editor from '../components/Editor';
import { categories } from '../utils';
import { HiUpload, HiX, HiSave, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', subtitle: '', content: '', category: 'Technology', tags: '', status: 'draft'
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const { data } = await blogService.getBlogById(id);
        const blog = data.blog;
        setForm({
          title: blog.title || '',
          subtitle: blog.subtitle || '',
          content: blog.content || '',
          category: blog.category || 'Technology',
          tags: blog.tags?.join(', ') || '',
          status: blog.status || 'draft',
        });
        setCoverPreview(blog.coverImage || '');
      } catch { toast.error('Failed to load blog'); navigate('/dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.content.trim() || form.content === '<p></p>') return toast.error('Content is required');

    const isSave = status === 'draft';
    if (isSave) setSaving(true); else setPublishing(true);

    try {
      const formData = new FormData();
      Object.entries({ ...form, status }).forEach(([k, v]) => formData.append(k, v));
      if (coverImage) formData.append('coverImage', coverImage);

      const fn = isEdit ? blogService.updateBlog(id, formData) : blogService.createBlog(formData);
      const { data } = await fn;
      toast.success(isSave ? 'Draft saved' : 'Published!');
      navigate(`/blog/${data.blog._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); setPublishing(false); }
  };

  if (loading) return (
    <div className="pt-28 max-w-4xl mx-auto px-4 space-y-4">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-clash font-bold text-3xl text-white">{isEdit ? 'Edit Story' : 'New Story'}</h1>
            <p className="text-zinc-600 text-sm mt-1">
              {isEdit ? 'Update your published story' : 'Share your thoughts with the world'}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit('draft')} disabled={saving || publishing}
              className="neo-button px-5 py-2.5 text-sm font-medium text-zinc-300 flex items-center gap-2 disabled:opacity-50">
              <HiSave size={16} />
              {saving ? 'Saving...' : 'Save Draft'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit('published')} disabled={saving || publishing}
              className="neo-button-primary neo-button px-5 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
              <HiEye size={16} />
              {publishing ? 'Publishing...' : 'Publish'}
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-5">
          {/* Cover Image */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            {coverPreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="neo-button px-4 py-2 text-sm cursor-pointer flex items-center gap-2">
                    <HiUpload size={16} /> Change Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <button onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                    className="ml-3 neo-button p-2 rounded-xl text-red-400">
                    <HiX size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="neo-card flex flex-col items-center justify-center h-48 cursor-pointer border-dashed border-2 border-white/08 hover:border-white/15 transition-colors">
                <HiUpload size={28} className="text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-500">Upload cover image</p>
                <p className="text-xs text-zinc-700 mt-1">PNG, JPG, WebP up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Your story title..."
              className="neo-input px-5 py-4 font-clash font-semibold text-2xl placeholder:text-zinc-700"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <input
              type="text"
              value={form.subtitle}
              onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Subtitle (optional)"
              className="neo-input px-5 py-3 text-lg placeholder:text-zinc-700 text-zinc-300"
            />
          </motion.div>

          {/* Category & Tags */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-600 font-medium mb-2 block uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="neo-input px-4 py-3 text-sm cursor-pointer">
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#161616]">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-600 font-medium mb-2 block uppercase tracking-wider">Tags (comma separated)</label>
              <input type="text" value={form.tags}
                onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="react, javascript, tutorial"
                className="neo-input px-4 py-3 text-sm" />
            </div>
          </motion.div>

          {/* Editor */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <label className="text-xs text-zinc-600 font-medium mb-2 block uppercase tracking-wider">Content</label>
            <Editor content={form.content} onChange={(html) => setForm(prev => ({ ...prev, content: html }))} />
          </motion.div>

          {/* Bottom Save */}
          <div className="flex justify-end gap-3 pt-4">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit('draft')} disabled={saving}
              className="neo-button px-6 py-3 text-sm font-medium text-zinc-300 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Draft'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit('published')} disabled={publishing}
              className="neo-button-primary neo-button px-6 py-3 text-sm font-semibold disabled:opacity-50">
              {publishing ? 'Publishing...' : 'Publish Story'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
