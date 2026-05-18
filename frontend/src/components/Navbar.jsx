import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { searchProducts } from '../services/api';
import { debounce, formatPrice } from '../utils/helpers';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Shop',     to: '/products' },
  { label: 'Customize',to: '/customize' },
  { label: 'AI Chat',  to: '/ai-chat' },
  { label: 'About',    to: '/about' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [searching,  setSearching]  = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore(s => s.getItemCount());
  const navigate  = useNavigate();
  const location  = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  const doSearch = debounce(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await searchProducts(q);
      setResults(data.data || []);
    } finally { setSearching(false); }
  }, 400);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?search=${encodeURIComponent(query)}`); setSearchOpen(false); }
  };

  return (
    <>
      <motion.nav
        animate={scrolled ? 'scrolled' : 'top'}
        variants={{
          top:     { backgroundColor: 'rgba(0,0,0,0)', borderBottomColor: 'transparent' },
          scrolled:{ backgroundColor: 'rgba(10,10,10,0.95)', borderBottomColor: 'rgba(201,168,76,0.2)' },
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all">
                <span className="text-black font-bold text-xl">✦</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl font-bold text-white">Chaitanya</span>
                <span className="font-display text-xl font-bold text-gold-500"> FrameMakers</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link pb-1 text-sm font-medium ${location.pathname === link.to ? 'text-gold-400 after:w-full' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-2 rounded-xl"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart */}
              <Link to="/cart" className="btn-ghost p-2 rounded-xl relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white/80 max-w-[80px] truncate">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 card-dark shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-gold-400 hover:bg-white/5 text-sm font-medium">
                        ⚙ Admin Panel
                      </Link>
                    )}
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:bg-white/5 text-sm">
                      📦 My Orders
                    </Link>
                    <hr className="border-dark-700 my-1" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-white/5 text-sm text-left">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-gold py-2 px-4 text-sm hidden md:flex">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden btn-ghost p-2 rounded-xl"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <div className="space-y-1.5">
                  <motion.span
                    animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                  <motion.span
                    animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    className="block w-6 h-0.5 bg-white"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-dark-950/98 border-t border-white/10 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.to} to={link.to}
                    className="block py-3 text-white/80 hover:text-gold-400 font-medium border-b border-white/5">
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/login" className="btn-gold w-full mt-4 justify-center">Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchRef}
                  autoFocus
                  value={query}
                  onChange={handleSearch}
                  placeholder="Search frames, gifts, canvas art…"
                  className="w-full px-6 py-4 pr-14 bg-dark-900 border-2 border-gold-500 rounded-2xl
                             text-white text-lg placeholder-dark-400 focus:outline-none shadow-gold"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {results.length > 0 && (
                <div className="mt-2 card-dark overflow-hidden shadow-xl">
                  {results.map(p => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors border-b border-dark-800 last:border-0"
                    >
                      <img
                        src={p.image || '/placeholder.jpg'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-gold-500 text-sm font-bold">
                          {formatPrice(p.sale_price || p.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searching && (
                <div className="mt-2 card-dark px-5 py-4 text-center text-white/50 text-sm">
                  Searching…
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
