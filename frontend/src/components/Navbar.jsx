import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { searchProducts } from '../services/api';
import { debounce, formatPrice } from '../utils/helpers';

const NAV_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'Shop',      to: '/products' },
  { label: 'Customize', to: '/customize' },
  { label: 'AI Chat',   to: '/ai-chat' },
  { label: 'About',     to: '/about' },
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
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, 400);

  const handleSearch = (e) => { setQuery(e.target.value); doSearch(e.target.value); };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?search=${encodeURIComponent(query)}`); setSearchOpen(false); }
  };

  const navBg        = scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)';
  const navBorder    = scrolled ? 'rgba(0,0,0,0.08)' : 'transparent';
  const navShadow    = scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';

  return (
    <>
      <motion.nav
        animate={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
        style={{ boxShadow: navShadow }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="/logo.jpg"
                alt="Chaitanya FrameMakers"
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: '0 2px 12px rgba(139,0,0,0.2)' }}
              />
              <div className="hidden sm:block leading-tight">
                <p className="font-display text-base font-bold leading-none" style={{ color: '#1a0000' }}>Chaitanya</p>
                <p className="font-display text-base font-bold leading-none" style={{ color: '#CC0000' }}>FrameMakers</p>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className="nav-link text-sm font-medium pb-1"
                  style={location.pathname === link.to ? { color: '#CC0000' } : {}}>
                  {link.label}
                  {location.pathname === link.to && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: '#CC0000' }} />
                  )}
                </Link>
              ))}
            </div>

            {/* ── Right Icons ── */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl transition-all duration-200 hover:bg-black/5"
                style={{ color: '#555' }} aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart */}
              <Link to="/cart" className="p-2.5 rounded-xl relative transition-all duration-200 hover:bg-black/5"
                style={{ color: '#555' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-xs
                                   font-bold rounded-full flex items-center justify-center"
                    style={{ background: '#CC0000' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-black/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,#CC0000,#8B0000)' }}>
                      {user?.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium max-w-[80px] truncate" style={{ color: '#333' }}>
                      {user?.name}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border py-2 shadow-xl
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200"
                    style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                    {user?.role === 'admin' && (
                      <Link to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
                        style={{ color: '#CC0000' }}>
                        ⚙ Admin Panel
                      </Link>
                    )}
                    <Link to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                      style={{ color: '#444' }}>
                      📦 My Orders
                    </Link>
                    <hr style={{ borderColor: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
                    <button onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm text-left transition-colors">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login"
                  className="hidden md:flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button className="lg:hidden p-2.5 rounded-xl transition-all hover:bg-black/5"
                style={{ color: '#555' }}
                onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                <div className="space-y-1.5">
                  <motion.span animate={menuOpen ? { rotate: 45, y: 8 }   : { rotate: 0, y: 0 }}
                    className="block w-6 h-0.5 rounded-full" style={{ background: '#333' }} />
                  <motion.span animate={menuOpen ? { opacity: 0 }          : { opacity: 1 }}
                    className="block w-6 h-0.5 rounded-full" style={{ background: '#333' }} />
                  <motion.span animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    className="block w-6 h-0.5 rounded-full" style={{ background: '#333' }} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t overflow-hidden"
              style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.to} to={link.to}
                    className="block py-3 font-medium border-b transition-colors"
                    style={{ color: location.pathname === link.to ? '#CC0000' : '#444', borderColor: 'rgba(0,0,0,0.05)' }}>
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/login"
                    className="flex items-center justify-center font-semibold text-white w-full mt-4 py-3 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Search Modal ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setSearchOpen(false)}>
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input ref={searchRef} autoFocus value={query} onChange={handleSearch}
                  placeholder="Search frames, gifts, canvas art…"
                  className="w-full px-6 py-4 pr-14 text-lg focus:outline-none rounded-2xl"
                  style={{
                    background: '#fff',
                    border: '2px solid #CC0000',
                    color: '#1a0000',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                    fontFamily: 'Inter, sans-serif',
                  }} />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#CC0000' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {results.length > 0 && (
                <div className="mt-2 rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}>
                  {results.map(p => (
                    <Link key={p.id} to={`/products/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors border-b last:border-0"
                      style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <img src={p.image || '/placeholder.jpg'} alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1a0000' }}>{p.name}</p>
                        <p className="text-sm font-bold" style={{ color: '#CC0000' }}>
                          {formatPrice(p.sale_price || p.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searching && (
                <div className="mt-2 rounded-2xl px-5 py-4 text-center text-sm"
                  style={{ background: '#fff', color: '#888', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
