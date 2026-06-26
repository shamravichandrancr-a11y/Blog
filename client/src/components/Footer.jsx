import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';

const footerLinks = {
  Platform: [
    { label: 'Home', to: '/' },
    { label: 'Explore', to: '/explore' },
    { label: 'Categories', to: '/explore' },
    { label: 'Write', to: '/write' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Press', to: '#' },
  ],
  Legal: [
    { label: 'Privacy', to: '#' },
    { label: 'Terms', to: '#' },
    { label: 'Cookie Policy', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/05">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center">
                <span className="font-clash font-bold text-sm chrome-text">I</span>
              </div>
              <span className="font-clash font-bold text-base chrome-text tracking-wider">INKFLOW</span>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              The premium writing platform for modern storytellers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/05">
          <p className="text-zinc-700 text-xs">© 2025 INKFLOW. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-zinc-700">
            <HiSparkles size={12} className="text-zinc-600" />
            Built with passion for writers
          </div>
        </div>
      </div>
    </footer>
  );
}
