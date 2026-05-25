import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { name:'', slug:'', sku:'', description:'', short_desc:'', price:'', sale_price:'',
  stock:'', category_id:'', material:'', dimensions:'', is_customizable:0, is_featured:0,
  is_bestseller:0, is_trending:0, is_active:1, meta_title:'', meta_desc:'', tags:'' };

export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [images,     setImages]     = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({ page, limit: 20, search: search || undefined });
      setProducts(data.data);
      setTotal(data.pagination.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { getCategories().then(r => setCategories(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImages([]); setModal(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '') });
    setImages([]);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      images.forEach(f => fd.append('images', f));
      if (editing) await updateProduct(editing.id, fd);
      else         await createProduct(fd);
      toast.success(editing ? 'Product updated!' : 'Product created!');
      setModal(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    toast.success('Product deactivated');
    load();
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Helmet><title>Products — Admin</title></Helmet>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Products</h1>
          <p className="text-dark-400 text-sm mt-1">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Add Product</button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…" className="input-field max-w-sm" />
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                {['Product','Category','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-12 rounded-xl" /></td></tr>
                ))
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-dark-800/50 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(p.image)} alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl bg-dark-800" />
                      <div>
                        <p className="text-white font-medium text-sm line-clamp-1">{p.name}</p>
                        <p className="text-dark-500 text-xs font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-dark-400 text-sm">{p.category_name || '—'}</td>
                  <td className="px-5 py-4">
                    <p className="text-white font-medium text-sm">{formatPrice(p.sale_price || p.price)}</p>
                    {p.sale_price && <p className="text-dark-500 text-xs line-through">{formatPrice(p.price)}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_featured   === 1 && <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">Featured</span>}
                      {p.is_bestseller === 1 && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Bestseller</span>}
                      {p.is_trending   === 1 && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Trending</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="px-3 py-1.5 text-xs border border-dark-700 text-white/70 hover:text-gold-400 hover:border-gold-500 rounded-lg transition-all">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 text-xs border border-dark-700 text-white/70 hover:text-red-400 hover:border-red-500 rounded-lg transition-all">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-8 px-4 pb-8 overflow-y-auto"
            onClick={e => e.target === e.currentTarget && setModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-dark w-full max-w-3xl p-8 my-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-bold text-white">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setModal(false)} className="text-dark-400 hover:text-white text-2xl">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Product Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Eternal Love LED Frame" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">SKU *</label>
                    <input value={form.sku} onChange={e => set('sku', e.target.value)}
                      placeholder="SKU-LED-001" className="input-field" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Slug *</label>
                    <input value={form.slug} onChange={e => set('slug', e.target.value)}
                      placeholder="eternal-love-led-frame" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Category</label>
                    <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input-field">
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Short Description</label>
                  <input value={form.short_desc} onChange={e => set('short_desc', e.target.value)}
                    placeholder="Brief product description" className="input-field" />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Full Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={4} className="input-field resize-none" placeholder="Detailed product description…" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                      placeholder="999" className="input-field" required min={0} />
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Sale Price (₹)</label>
                    <input type="number" value={form.sale_price} onChange={e => set('sale_price', e.target.value)}
                      placeholder="799" className="input-field" min={0} />
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)}
                      placeholder="50" className="input-field" required min={0} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Material</label>
                    <input value={form.material} onChange={e => set('material', e.target.value)}
                      placeholder="Solid Wood / Acrylic…" className="input-field" />
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm mb-1.5 block">Dimensions</label>
                    <input value={form.dimensions} onChange={e => set('dimensions', e.target.value)}
                      placeholder="5x7 inch / A4…" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="led, couple, anniversary, gift" className="input-field" />
                </div>
                <div className="flex flex-wrap gap-4">
                  {[['is_featured','Featured'],['is_bestseller','Bestseller'],['is_trending','Trending'],['is_customizable','Customizable']].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 rounded accent-gold-500" />
                      <span className="text-white/80 text-sm">{l}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Product Images</label>
                  <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])}
                    className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-500/20 file:text-gold-400 file:text-sm cursor-pointer" />
                  {images.length > 0 && <p className="text-dark-400 text-xs mt-1">{images.length} file(s) selected</p>}
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
