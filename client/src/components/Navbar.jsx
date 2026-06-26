import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils';
import {
  HiHome, HiSearch, HiBookmark, HiPencilAlt, HiUser, HiLogout, HiMenuAlt3, HiX, HiSparkles, HiChartBar
} from 'react-icons/hi';

const InkflowLogo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#D4D4D8" />
        <stop offset="70%" stopColor="#a0a0a8" />
        <stop offset="100%" stopColor="#D4D4D8" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="36" height="36" rx="10" fill="#111111" />
    <rect x="1" y="1" width="34" height="34" rx="9" fill="none" stroke="url(#logoGrad)" strokeWidth="0.5" />
    <text x="18" y="26" fontFamily="'Clash Display', sans-serif" fontSize="22" fontWeight="700" fill="url(#logoGrad)" textAnchor="middle" filter="url(#logoGlow)">I</text>
  </svg>
);

const navLinks = [
  { to: '/', label: 'Home', icon: HiHome },
  { to: '/explore', label: 'Explore', icon: HiSearch },
  { to: '/write', label: 'Write', icon: HiPencilAlt },
  { to: '/bookmarks', label: 'Bookmarks', icon: HiBookmark },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl"
      >
        <div className="glass-strong rounded-[30px] px-4 py-3 flex items-center justify-between"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <InkflowLogo />
            <span className="font-clash font-bold text-lg chrome-text tracking-wider">INKFLOW</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-zinc-400 hover:text-white hover:bg-white/05'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 neo-button px-3 py-2"
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                  <span className="hidden sm:block text-sm font-medium text-zinc-300 max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 neo-card overflow-hidden"
                      style={{ zIndex: 100 }}
                    >
                      <div className="p-3 border-b border-white/05">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      {[
                        { to: '/profile', label: 'Profile', icon: HiUser },
                        { to: '/dashboard', label: 'Dashboard', icon: HiChartBar },
                        { to: '/write', label: 'Write', icon: HiPencilAlt },
                        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: HiSparkles }] : []),
                      ].map(({ to, label, icon: Icon }) => (
                        <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/05 transition-colors">
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/05 transition-colors w-full border-t border-white/05">
                        <HiLogout size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="neo-button px-4 py-2 text-sm font-medium text-zinc-300">Login</Link>
                <Link to="/register" className="neo-button-primary neo-button px-4 py-2 text-sm font-semibold">Get Started</Link>
              </div>
            )}

            <button className="md:hidden neo-button p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-strong rounded-2xl mt-2 overflow-hidden"
            >
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-4 text-sm font-medium border-b border-white/05 ${
                      isActive ? 'text-white bg-white/05' : 'text-zinc-400'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Click outside to close */}
      {(profileOpen || mobileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setMobileOpen(false); }} />
      )}
    </>
  );
}
