import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'price-ASC',       label: 'Price: Low to High' },
  { value: 'price-DESC',      label: 'Price: High to Low' },
  { value: 'rating_avg-DESC', label: 'Top Rated' },
  { value: 'views-DESC',      label: 'Most Popular' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const page     = parseInt(params.get('page'))     || 1;
  const category = params.get('category')           || '';
  const search   = params.get('search')             || '';
  const sort     = params.get('sort')               || 'created_at-DESC';
  const minPrice = params.get('minPrice')           || '';
  const maxPrice = params.get('maxPrice')           || '';
  const featured = params.get('featured')           || '';
  const bestseller = params.get('bestseller')       || '';
  const trending   = params.get('trending')         || '';

  const [sortField, sortOrder] = sort.split('-');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({
        page, limit: 16, category, search, sort: sortField, order: sortOrder,
        minPrice, maxPrice, featured, bestseller, trending,
      });
      setProducts(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [page, category, search, sort, minPrice, maxPrice, featured, bestseller, trending]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data));
  }, []);

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setParams(p);
  };

  return (
    <>
      <Helmet>
        <title>Shop All Frames & Gifts — Chaitanya FrameMakers</title>
        <meta name="description" content="Browse our complete collection of premium photo frames, LED frames, canvas art, couple gifts and personalized items." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="section-title mb-2">
            {category
              ? categories.find(c => c.slug === category)?.name || 'Products'
              : search ? `Results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-dark-400 text-sm">
            {pagination.total ? `${pagination.total} products found` : 'Discover our premium collection'}
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`shrink-0 w-64 space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            {/* Categories */}
            <div className="card-dark p-5">
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Categories</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-gold-500/20 text-gold-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setParam('category', c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === c.slug ? 'bg-gold-500/20 text-gold-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="card-dark p-5">
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Price Range</h3>
              <div className="space-y-3">
                {[
                  { label: 'Under ₹500',   min: '',    max: '500' },
                  { label: '₹500 - ₹1000', min: '500', max: '1000' },
                  { label: '₹1000 - ₹2000',min: '1000',max: '2000' },
                  { label: 'Above ₹2000',  min: '2000',max: '' },
                ].map(r => (
                  <button
                    key={r.label}
                    onClick={() => { setParam('minPrice', r.min); setParam('maxPrice', r.max); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${minPrice === r.min && maxPrice === r.max ? 'bg-gold-500/20 text-gold-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
                  className="text-xs text-dark-500 hover:text-gold-400 transition-colors"
                >
                  Clear price filter
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="card-dark p-5">
              <h3 className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">Filter By</h3>
              <div className="space-y-2">
                {[
                  { label: '⭐ Featured',    key: 'featured',   val: '1' },
                  { label: '🔥 Bestsellers', key: 'bestseller', val: '1' },
                  { label: '📈 Trending',    key: 'trending',   val: '1' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setParam(f.key, params.get(f.key) === f.val ? '' : f.val)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${params.get(f.key) === f.val ? 'bg-gold-500/20 text-gold-400 font-medium' : 'text-dark-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Sort & Filter toggle */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                className="lg:hidden btn-outline py-2 px-4 text-sm"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                🔧 Filters
              </button>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-dark-400 text-sm hidden md:block">Sort by:</span>
                <select
                  value={sort}
                  onChange={e => setParam('sort', e.target.value)}
                  className="input-field py-2 text-sm w-auto"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 text-center">
                <div className="text-6xl mb-6">🖼️</div>
                <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
                <p className="text-dark-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${page}-${category}-${sort}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {products.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages || 1}
              onPageChange={p => setParam('page', p.toString())}
            />
          </div>
        </div>
      </div>
    </>
  );
}
