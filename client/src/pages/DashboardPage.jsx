import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { blogService } from '../services';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { HiEye, HiHeart, HiAnnotation, HiUserGroup, HiPencilAlt, HiDocumentText, HiTrendingUp } from 'react-icons/hi';
import { formatDate } from '../utils';

const StatCard = ({ label, value, icon: Icon, change, index }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
    className="neo-card p-5 flex items-start gap-4">
    <div className="w-11 h-11 rounded-xl neo-card flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-zinc-400" />
    </div>
    <div>
      <p className="text-2xl font-clash font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="neo-card px-4 py-3 text-sm border border-white/10">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, blogsRes] = await Promise.all([blogService.getStats(), blogService.getMyBlogs()]);
        setStats(statsRes.data.stats);
        setMyBlogs(blogsRes.data.blogs);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="pt-28 pb-16 max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );

  const monthlyData = stats ? Object.entries(stats.monthlyViews).map(([month, views]) => ({ month, views })) : [];
  const categoryData = stats ? Object.entries(stats.categories).map(([name, count]) => ({ name, count })) : [];
  const COLORS = ['#D4D4D8', '#A1A1AA', '#71717A', '#52525B', '#3F3F46'];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-clash font-bold text-3xl text-white">Dashboard</h1>
            <p className="text-zinc-600 text-sm mt-1">Your writing analytics</p>
          </div>
          <Link to="/write" className="neo-button-primary neo-button px-5 py-2.5 text-sm font-semibold flex items-center gap-2">
            <HiPencilAlt size={16} /> Write New Story
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Posts" value={stats?.totalBlogs || 0} icon={HiDocumentText} index={0} />
          <StatCard label="Total Views" value={stats?.totalViews || 0} icon={HiEye} index={1} />
          <StatCard label="Total Likes" value={stats?.totalLikes || 0} icon={HiHeart} index={2} />
          <StatCard label="Published" value={stats?.publishedBlogs || 0} icon={HiTrendingUp} index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Views Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="neo-card p-6 lg:col-span-2">
            <h3 className="font-clash font-semibold text-white mb-4">Monthly Views</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4D4D8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D4D4D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#4b4b4b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b4b4b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="views" stroke="#D4D4D8" strokeWidth={2} fill="url(#viewGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-zinc-700 text-sm text-center py-16">No data yet. Publish your first story!</p>}
          </motion.div>

          {/* Category Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="neo-card p-6">
            <h3 className="font-clash font-semibold text-white mb-4">Categories</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count">
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#71717A', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-zinc-700 text-sm text-center py-16">No categories yet</p>}
          </motion.div>
        </div>

        {/* Recent Blogs Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="neo-card p-6">
          <h3 className="font-clash font-semibold text-white mb-4">Your Stories</h3>
          {myBlogs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-600 text-sm">No stories yet</p>
              <Link to="/write" className="neo-button-primary neo-button px-5 py-2 text-sm font-semibold inline-flex mt-4">Start Writing</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-600 uppercase tracking-wider border-b border-white/06">
                    <th className="text-left py-3 pr-4">Title</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3 pr-4">Views</th>
                    <th className="text-right py-3 pr-4">Likes</th>
                    <th className="text-right py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myBlogs.map(blog => (
                    <tr key={blog._id} className="border-b border-white/04 hover:bg-white/02 transition-colors">
                      <td className="py-3.5 pr-4">
                        <Link to={`/blog/${blog._id}`} className="text-zinc-300 hover:text-white transition-colors line-clamp-1 max-w-[250px] block">
                          {blog.title}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right text-zinc-500">{blog.views?.toLocaleString()}</td>
                      <td className="py-3.5 pr-4 text-right text-zinc-500">{blog.likes?.length}</td>
                      <td className="py-3.5 text-right text-zinc-600">{formatDate(blog.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
