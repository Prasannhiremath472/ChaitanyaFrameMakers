import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { subscribe } from '../services/api';
import toast from 'react-hot-toast';

const LINKS = {
  Shop: [
    { label: 'Photo Frames',   to: '/products?category=personalized-photo-frames' },
    { label: 'LED Frames',     to: '/products?category=led-frames' },
    { label: 'Canvas Wall Art',to: '/products?category=canvas-wall-art' },
    { label: 'Couple Gifts',   to: '/products?category=couple-gifts' },
    { label: 'Corporate Gifts',to: '/products?category=corporate-gifts' },
  ],
  Company: [
    { label: 'About Us',     to: '/about' },
    { label: 'AI Gift Guide',to: '/ai-chat' },
    { label: 'Customize',    to: '/customize' },
    { label: 'Privacy Policy',to: '/privacy' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } finally { setLoading(false); }
  };

  return (
    <footer className="relative bg-dark-950 border-t border-gold-700/20 mt-24">
      {/* Gold accent top line */}
      <div className="h-0.5 bg-gold-gradient" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="text-black font-bold text-2xl">✦</span>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">Chaitanya</div>
                <div className="font-display text-xl font-bold text-gold-500">FrameMakers</div>
              </div>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Crafting premium photo frames & personalized gifts that transform your cherished
              memories into timeless keepsakes.
            </p>
            <div className="flex gap-3">
              {[
                { href: '#', icon: '📘', label: 'Facebook' },
                { href: '#', icon: '📸', label: 'Instagram' },
                { href: '#', icon: '🐦', label: 'Twitter' },
                { href: '#', icon: '▶️', label: 'YouTube' },
              ].map(s => (
                <a key={s.label} href={s.href}
                  className="w-10 h-10 glass-card flex items-center justify-center text-lg hover:border-gold-500/50 transition-all hover:shadow-gold">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-lg font-bold text-white mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to}
                      className="text-dark-400 hover:text-gold-400 text-sm transition-colors duration-200 flex items-center gap-2 group">
                      <span className="text-gold-600 group-hover:text-gold-400 transition-colors">›</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-bold text-white mb-5">Stay Updated</h4>
            <p className="text-dark-400 text-sm mb-4">
              Get exclusive offers, new arrivals & gift inspiration delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field text-sm"
                required
              />
              <button type="submit" disabled={loading}
                className="btn-gold w-full text-sm justify-center disabled:opacity-60">
                {loading ? 'Subscribing…' : '✉ Subscribe'}
              </button>
            </form>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-dark-400 hover:text-green-400 text-sm transition-colors">
                💬 WhatsApp: +91 99999 99999
              </a>
              <a href="mailto:hello@chaitanyaframes.com"
                className="flex items-center gap-2 text-dark-400 hover:text-gold-400 text-sm transition-colors">
                ✉ hello@chaitanyaframes.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © 2026 Chaitanya FrameMakers. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy</Link>
            <span>·</span>
            <span>Razorpay Secured 🔒</span>
            <span>·</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <motion.a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999'}?text=Hi!%20I'm%20interested%20in%20your%20photo%20frames.`}
        target="_blank"
        rel="noreferrer"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400
                   text-white text-2xl rounded-full shadow-xl flex items-center justify-center
                   transition-colors duration-200 hover:shadow-2xl"
        aria-label="WhatsApp"
      >
        💬
      </motion.a>
    </footer>
  );
}
