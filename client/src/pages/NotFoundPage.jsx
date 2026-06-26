import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-clash text-[8rem] font-bold chrome-text leading-none mb-4">404</p>
        <h1 className="font-clash text-2xl text-white mb-3">Page Not Found</h1>
        <p className="text-zinc-600 text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="neo-button-primary neo-button px-6 py-3 text-sm font-semibold inline-flex">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
