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
    { label: 'About Us',      to: '/about' },
    { label: 'AI Gift Guide', to: '/ai-chat' },
    { label: 'Customize',     to: '/customize' },
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
    <footer className="relative mt-20" style={{ background: '#fafafa', borderTop: '1.5px solid rgba(0,0,0,0.07)' }}>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <img
                src="/logo.jpg"
                alt="Chaitanya FrameMakers"
                className="w-12 h-12 object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: '0 2px 12px rgba(139,0,0,0.15)' }}
              />
              <div>
                <div className="font-display text-lg font-bold leading-none" style={{ color: '#1a0000' }}>Chaitanya</div>
                <div className="font-display text-lg font-bold leading-none" style={{ color: '#CC0000' }}>FrameMakers</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#888', maxWidth: '240px' }}>
              Crafting premium photo frames & personalized gifts that transform your cherished memories into timeless keepsakes.
            </p>
            <div className="flex gap-2">
              {[
                { href: '#', icon: '📘', label: 'Facebook' },
                { href: '#', icon: '📸', label: 'Instagram' },
                { href: '#', icon: '▶️', label: 'YouTube' },
                { href: 'https://wa.me/919999999999', icon: '💬', label: 'WhatsApp' },
              ].map(s => (
                <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200"
                  style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.3)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(204,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                  aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-5" style={{ color: '#1a0000' }}>{title}</h4>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to}
                      className="text-sm transition-colors duration-200 flex items-center gap-2"
                      style={{ color: '#888' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#CC0000'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                      <span style={{ color: '#ddd' }}>›</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5" style={{ color: '#1a0000' }}>Stay Updated</h4>
            <p className="text-sm mb-4" style={{ color: '#888' }}>
              Exclusive offers, new arrivals & gift inspiration delivered to your inbox.
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
                className="btn-brand w-full text-sm justify-center disabled:opacity-60">
                {loading ? 'Subscribing…' : '✉ Subscribe'}
              </button>
            </form>
            <div className="mt-5 space-y-2">
              <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:text-green-600"
                style={{ color: '#888' }}>
                💬 WhatsApp Us
              </a>
              <a href="mailto:hello@chaitanyaframes.com"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: '#888' }}
                onMouseEnter={e => e.currentTarget.style.color = '#CC0000'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                ✉ hello@chaitanyaframes.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1.5px solid rgba(0,0,0,0.07)' }}>
          <p className="text-sm" style={{ color: '#bbb' }}>
            © 2026 Chaitanya FrameMakers. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm" style={{ color: '#bbb' }}>
            <Link to="/privacy" className="transition-colors hover:text-gray-600">Privacy</Link>
            <span>·</span>
            <span>Razorpay Secured 🔒</span>
            <span>·</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <motion.a
        href="https://wa.me/919999999999?text=Hi!%20I'm%20interested%20in%20your%20photo%20frames."
        target="_blank" rel="noreferrer"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400
                   text-white text-2xl rounded-full shadow-xl flex items-center justify-center
                   transition-colors duration-200"
        aria-label="WhatsApp"
        style={{ boxShadow: '0 8px 30px rgba(34,197,94,0.4)' }}>
        💬
      </motion.a>
    </footer>
  );
}
