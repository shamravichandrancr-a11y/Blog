import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Logged in as demo user');
      navigate('/');
    } catch { toast.error('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md">

        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl neo-card mb-4">
            <span className="font-clash font-bold text-2xl chrome-text">I</span>
          </motion.div>
          <h1 className="font-clash font-bold text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-600 text-sm">Sign in to your INKFLOW account</p>
        </div>

        <div className="neo-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-2">Email</label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com" className="neo-input pl-11 pr-4 py-3.5 text-sm" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={17} />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password" className="neo-input pl-11 pr-12 py-3.5 text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                  {showPass ? <HiEyeOff size={17} /> : <HiEye size={17} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="neo-button-primary neo-button w-full py-3.5 text-sm font-semibold mt-2 disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Demo Buttons */}
          <div className="mt-5 pt-5 border-t border-white/05">
            <p className="text-xs text-zinc-600 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => demoLogin('admin@inkflow.io', 'Admin@123')}
                className="neo-button py-2 text-xs text-zinc-400 hover:text-white transition-colors">
                Admin Demo
              </button>
              <button onClick={() => demoLogin('alex@inkflow.io', 'Pass@123')}
                className="neo-button py-2 text-xs text-zinc-400 hover:text-white transition-colors">
                User Demo
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-zinc-600 mt-5">
            New to INKFLOW?{' '}
            <Link to="/register" className="text-zinc-300 hover:text-white underline underline-offset-4 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
