import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProducts, getCategories } from '../services/api';
import { DUMMY_PRODUCTS, DUMMY_CATEGORIES } from '../data/dummyData';
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
  const [products,   setProducts]   = useState(DUMMY_PRODUCTS);
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);
  const [pagination, setPagination] = useState({ total: DUMMY_PRODUCTS.length });
  const [loading,    setLoading]    = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const page       = parseInt(params.get('page'))  || 1;
  const category   = params.get('category')        || '';
  const search     = params.get('search')          || '';
  const sort       = params.get('sort')            || 'created_at-DESC';
  const minPrice   = params.get('minPrice')        || '';
  const maxPrice   = params.get('maxPrice')        || '';
  const featured   = params.get('featured')        || '';
  const bestseller = params.get('bestseller')      || '';
  const trending   = params.get('trending')        || '';

  const [sortField, sortOrder] = sort.split('-');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({
        page, limit: 16, category, search, sort: sortField, order: sortOrder,
        minPrice, maxPrice, featured, bestseller, trending,
      });
      if (data.data?.length) {
        setProducts(data.data);
        setPagination(data.pagination);
      } else {
        // Use filtered dummy data
        let filtered = DUMMY_PRODUCTS;
        if (category)   filtered = filtered.filter(p => p.category_slug === category);
        if (search)     filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        if (featured)   filtered = filtered.filter(p => p.is_featured === 1);
        if (bestseller) filtered = filtered.filter(p => p.is_bestseller === 1);
        if (trending)   filtered = filtered.filter(p => p.is_trending === 1);
        if (minPrice)   filtered = filtered.filter(p => (p.sale_price || p.price) >= Number(minPrice));
        if (maxPrice)   filtered = filtered.filter(p => (p.sale_price || p.price) <= Number(maxPrice));
        setProducts(filtered);
        setPagination({ total: filtered.length, page: 1, totalPages: 1 });
      }
    } catch {
      let filtered = DUMMY_PRODUCTS;
      if (category)   filtered = filtered.filter(p => p.category_slug === category);
      if (search)     filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      if (featured)   filtered = filtered.filter(p => p.is_featured === 1);
      if (bestseller) filtered = filtered.filter(p => p.is_bestseller === 1);
      if (trending)   filtered = filtered.filter(p => p.is_trending === 1);
      if (minPrice)   filtered = filtered.filter(p => (p.sale_price || p.price) >= Number(minPrice));
      if (maxPrice)   filtered = filtered.filter(p => (p.sale_price || p.price) <= Number(maxPrice));
      setProducts(filtered);
      setPagination({ total: filtered.length, page: 1, totalPages: 1 });
    } finally { setLoading(false); }
  }, [page, category, search, sort, minPrice, maxPrice, featured, bestseller, trending]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getCategories()
      .then(r => { if (r.data.data?.length) setCategories(r.data.data); })
      .catch(() => {});
  }, []);

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setParams(p);
  };

  const activeCategory = categories.find(c => c.slug === category);

  return (
    <>
      <Helmet>
        <title>Shop All Frames & Gifts — Chaitanya FrameMakers</title>
        <meta name="description" content="Browse our complete collection of premium photo frames, LED frames, canvas art, couple gifts and personalized items." />
      </Helmet>

      <div style={{ background: '#fff', minHeight: '100vh' }}>
        {/* Page header */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-14 px-6 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {category ? 'Category' : search ? 'Search Results' : 'Our Collection'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            {activeCategory?.name || (search ? `"${search}"` : 'All Products')}
          </motion.h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {pagination.total ? `${pagination.total} products found` : 'Discover our premium collection'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`shrink-0 w-60 space-y-4 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
              {/* Categories */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #f0f0f0' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: '#1a0000' }}>Categories</h3>
                </div>
                <div className="p-3 max-h-72 overflow-y-auto space-y-0.5">
                  <FilterBtn active={!category} onClick={() => setParam('category', '')} label="All Categories" />
                  {categories.map(c => (
                    <FilterBtn key={c.id} active={category === c.slug}
                      onClick={() => setParam('category', c.slug)} label={c.name} />
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #f0f0f0' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: '#1a0000' }}>Price Range</h3>
                </div>
                <div className="p-3 space-y-0.5">
                  {[
                    { label: 'Under ₹500',    min: '',    max: '500' },
                    { label: '₹500 – ₹1,000', min: '500', max: '1000' },
                    { label: '₹1,000 – ₹2,000',min:'1000',max: '2000' },
                    { label: 'Above ₹2,000',  min: '2000',max: '' },
                  ].map(r => (
                    <FilterBtn key={r.label} label={r.label}
                      active={minPrice === r.min && maxPrice === r.max}
                      onClick={() => { setParam('minPrice', r.min); setParam('maxPrice', r.max); }} />
                  ))}
                  {(minPrice || maxPrice) && (
                    <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
                      className="text-xs px-3 py-1.5 mt-1 transition-colors"
                      style={{ color: '#CC0000' }}>
                      ✕ Clear filter
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #f0f0f0' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <h3 className="font-bold text-sm tracking-wide uppercase" style={{ color: '#1a0000' }}>Filter By</h3>
                </div>
                <div className="p-3 space-y-0.5">
                  {[
                    { label: '⭐ Featured',    key: 'featured',   val: '1' },
                    { label: '🔥 Bestsellers', key: 'bestseller', val: '1' },
                    { label: '📈 Trending',    key: 'trending',   val: '1' },
                  ].map(f => (
                    <FilterBtn key={f.key} label={f.label}
                      active={params.get(f.key) === f.val}
                      onClick={() => setParam(f.key, params.get(f.key) === f.val ? '' : f.val)} />
                  ))}
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <button className="lg:hidden btn-outline py-2 px-4 text-sm"
                  onClick={() => setFilterOpen(!filterOpen)}>
                  🔧 {filterOpen ? 'Hide' : 'Show'} Filters
                </button>

                {/* Active filter pills */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {category && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(204,0,0,0.1)', color: '#CC0000' }}>
                      {activeCategory?.name}
                      <button onClick={() => setParam('category', '')} className="hover:opacity-70">✕</button>
                    </span>
                  )}
                  {featured && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(204,0,0,0.1)', color: '#CC0000' }}>
                      Featured <button onClick={() => setParam('featured', '')} className="hover:opacity-70">✕</button>
                    </span>
                  )}
                  {bestseller && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(204,0,0,0.1)', color: '#CC0000' }}>
                      Bestsellers <button onClick={() => setParam('bestseller', '')} className="hover:opacity-70">✕</button>
                    </span>
                  )}
                  {trending && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: 'rgba(204,0,0,0.1)', color: '#CC0000' }}>
                      Trending <button onClick={() => setParam('trending', '')} className="hover:opacity-70">✕</button>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-sm hidden md:block" style={{ color: '#888' }}>Sort:</span>
                  <select value={sort} onChange={e => setParam('sort', e.target.value)}
                    className="input-field py-2 text-sm w-auto"
                    style={{ minWidth: '180px' }}>
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
                    <div key={i} className="skeleton aspect-square rounded-3xl" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-32 text-center">
                  <div className="text-7xl mb-6">🖼️</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#1a0000' }}>No products found</h3>
                  <p className="text-sm" style={{ color: '#888' }}>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={`${page}-${category}-${sort}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}>
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
      </div>
    </>
  );
}

function FilterBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 font-medium"
      style={active ? {
        background: 'rgba(204,0,0,0.1)',
        color: '#CC0000',
      } : { color: '#555' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8f8f8'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      {label}
    </button>
  );
}
