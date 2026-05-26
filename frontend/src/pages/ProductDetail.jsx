import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProduct, addReview } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/ProductCard';
import { formatPrice, getDiscount, getImageUrl, formatDate } from '../utils/helpers';
import { DUMMY_PRODUCTS } from '../data/dummyData';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);
  const [qty,        setQty]        = useState(1);
  const [tab,        setTab]        = useState('description');
  const [review,     setReview]     = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [zoom,       setZoom]       = useState(false);
  const [zoomPos,    setZoomPos]    = useState({ x: 50, y: 50 });

  const addItem = useCartStore(s => s.addItem);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    getProduct(slug)
      .then(r => setProduct(r.data.data))
      .catch(() => {
        // Fall back to dummy data
        const dummy = DUMMY_PRODUCTS.find(p => p.slug === slug);
        setProduct(dummy || null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ ...product, image: product.images?.[0]?.image_url || product.image }, qty);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to leave a review'); return; }
    setSubmitting(true);
    try {
      await addReview(product.id, review);
      toast.success('Review submitted for approval!');
      setReview({ rating: 5, title: '', body: '' });
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`skeleton h-8 rounded-xl ${i > 1 ? 'w-3/4' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
      <div className="text-center px-6">
        <div className="text-7xl mb-6">🖼️</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#1a0000' }}>Product Not Found</h2>
        <p className="text-sm mb-6" style={{ color: '#888' }}>The frame you're looking for may have been removed.</p>
        <Link to="/products" className="btn-brand px-8">Browse All Products</Link>
      </div>
    </div>
  );

  const images   = product.images?.length ? product.images : [{ image_url: product.image || '/placeholder.jpg', alt_text: product.name }];
  const discount = getDiscount(product.price, product.sale_price);
  const inStock  = product.stock > 0;

  const MetaChip = ({ label, value }) => (
    <div className="p-3 rounded-xl text-sm" style={{ background: '#f8f8f8', border: '1px solid #f0f0f0' }}>
      <span style={{ color: '#aaa' }}>{label}: </span>
      <span className="font-medium" style={{ color: '#1a0000' }}>{value}</span>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{product.meta_title || `${product.name} — Chaitanya FrameMakers`}</title>
        <meta name="description" content={product.meta_desc || product.short_desc} />
      </Helmet>

      <div style={{ background: '#fff', minHeight: '100vh' }}>
        {/* Breadcrumb */}
        <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-2 text-sm" style={{ color: '#aaa' }}>
              <Link to="/" className="transition-colors hover:text-red-700">Home</Link>
              <span>›</span>
              <Link to="/products" className="transition-colors hover:text-red-700">Shop</Link>
              {product.category_name && (
                <>
                  <span>›</span>
                  <Link to={`/products?category=${product.category_slug}`} className="transition-colors hover:text-red-700">
                    {product.category_name}
                  </Link>
                </>
              )}
              <span>›</span>
              <span className="truncate max-w-[200px]" style={{ color: '#555' }}>{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main image with zoom */}
              <div className="relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in"
                style={{ background: '#f8f8f8', border: '1.5px solid #f0f0f0' }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}>
                <img
                  src={getImageUrl(images[activeImg]?.image_url)}
                  alt={images[activeImg]?.alt_text || product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={zoom ? { transform: `scale(1.6)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#CC0000' }}>
                    -{discount}% OFF
                  </div>
                )}
                {product.is_bestseller === 1 && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                    ⭐ Bestseller
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all"
                      style={{
                        border: i === activeImg ? '2px solid #CC0000' : '2px solid transparent',
                        boxShadow: i === activeImg ? '0 0 15px rgba(204,0,0,0.3)' : 'none',
                        opacity: i === activeImg ? 1 : 0.55,
                        background: '#f8f8f8',
                      }}>
                      <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }} className="space-y-6">

              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#CC0000' }}>
                  {product.category_name}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3" style={{ color: '#1a0000' }}>
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating_count > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className="w-4 h-4"
                          style={{ color: s <= Math.round(product.rating_avg) ? '#CC0000' : '#e5e5e5' }}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm" style={{ color: '#888' }}>
                      {product.rating_avg} ({product.rating_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-4">
                <span className="font-display text-4xl font-bold" style={{ color: '#CC0000' }}>
                  {formatPrice(product.sale_price || product.price)}
                </span>
                {product.sale_price && (
                  <span className="text-xl line-through mb-0.5" style={{ color: '#ccc' }}>
                    {formatPrice(product.price)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold mb-0.5 px-2 py-0.5 rounded-lg"
                    style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{product.short_desc}</p>

              {/* Product meta chips */}
              <div className="grid grid-cols-2 gap-2">
                {product.material && <MetaChip label="Material" value={product.material} />}
                {product.dimensions && <MetaChip label="Size" value={product.dimensions} />}
                {product.brand && <MetaChip label="Brand" value={product.brand} />}
                {product.sku && <MetaChip label="SKU" value={product.sku} />}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: inStock ? '#22c55e' : '#ef4444' }} />
                <span style={{ color: inStock ? '#15803d' : '#dc2626' }}>
                  {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Qty + CTA */}
              {inStock && (
                <div className="flex gap-3">
                  <div className="flex items-center rounded-2xl overflow-hidden"
                    style={{ border: '1.5px solid #ebebeb' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-11 h-12 flex items-center justify-center text-xl font-medium transition-colors hover:bg-gray-50"
                      style={{ color: '#555' }}>−</button>
                    <span className="w-12 text-center font-bold text-base"
                      style={{ color: '#1a0000', borderLeft: '1px solid #ebebeb', borderRight: '1px solid #ebebeb', lineHeight: '48px' }}>
                      {qty}
                    </span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-11 h-12 flex items-center justify-center text-xl font-medium transition-colors hover:bg-gray-50"
                      style={{ color: '#555' }}>+</button>
                  </div>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleAddToCart}
                    className="btn-brand flex-1 text-base">
                    🛒 Add to Cart
                  </motion.button>
                </div>
              )}

              {product.is_customizable === 1 && (
                <Link to="/customize" className="btn-outline w-full justify-center">
                  🎨 Customize with Your Photo
                </Link>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {['🚚 Free shipping ₹999+', '🔒 Secure checkout', '↩️ 7-day returns', '⭐ Quality guaranteed'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                    style={{ background: '#fafafa', color: '#777', border: '1px solid #f0f0f0' }}>
                    {b}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-20">
            <div className="flex gap-0 border-b" style={{ borderColor: '#f0f0f0' }}>
              {['description', 'reviews', 'shipping'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-6 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-all"
                  style={tab === t
                    ? { borderColor: '#CC0000', color: '#CC0000' }
                    : { borderColor: 'transparent', color: '#aaa' }}>
                  {t === 'reviews' ? `Reviews (${product.reviews?.length || 0})` : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="pt-8">
              <AnimatePresence mode="wait">
                {tab === 'description' && (
                  <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="prose max-w-none text-sm leading-relaxed"
                      style={{ color: '#555' }}
                      dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br>') || `<p>${product.short_desc}</p>` }} />
                  </motion.div>
                )}

                {tab === 'reviews' && (
                  <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-8">
                    {product.reviews?.length > 0 ? (
                      <div className="space-y-4">
                        {product.reviews.map(r => (
                          <div key={r.id} className="p-6 rounded-2xl"
                            style={{ background: '#fafafa', border: '1.5px solid #f0f0f0' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-bold text-sm" style={{ color: '#1a0000' }}>
                                  {r.user_name || r.guest_name || 'Customer'}
                                </p>
                                <p className="text-xs" style={{ color: '#bbb' }}>{formatDate(r.created_at)}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <span key={s} style={{ color: s <= r.rating ? '#CC0000' : '#e5e5e5', fontSize: '14px' }}>★</span>
                                ))}
                              </div>
                            </div>
                            {r.title && <p className="font-semibold text-sm mb-2" style={{ color: '#1a0000' }}>{r.title}</p>}
                            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{r.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-sm" style={{ color: '#aaa' }}>
                        No reviews yet — be the first to review this product!
                      </p>
                    )}

                    {/* Write review */}
                    <div className="p-8 rounded-3xl" style={{ background: '#fafafa', border: '1.5px solid #f0f0f0' }}>
                      <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#1a0000' }}>Write a Review</h3>
                      <form onSubmit={handleReview} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium block mb-2" style={{ color: '#555' }}>Your Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                                className="text-3xl transition-transform hover:scale-110">
                                <span style={{ color: s <= review.rating ? '#CC0000' : '#e5e5e5' }}>★</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <input value={review.title}
                          onChange={e => setReview(r => ({ ...r, title: e.target.value }))}
                          placeholder="Review title" className="input-field" />
                        <textarea value={review.body}
                          onChange={e => setReview(r => ({ ...r, body: e.target.value }))}
                          placeholder="Share your experience with this product…"
                          rows={4} className="input-field resize-none" required />
                        <button type="submit" disabled={submitting} className="btn-brand disabled:opacity-60">
                          {submitting ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {tab === 'shipping' && (
                  <motion.div key="ship" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: '🚚', title: 'Free Shipping', desc: 'Free shipping on all orders above ₹999. Flat ₹79 for orders below.' },
                      { icon: '📅', title: 'Delivery Time', desc: '5-7 business days standard. Express 2-3 days available at checkout.' },
                      { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy for manufacturing defects. Full refund or replacement.' },
                      { icon: '📦', title: 'Safe Packaging', desc: 'Premium bubble-wrap + box packaging ensures safe delivery every time.' },
                    ].map(s => (
                      <div key={s.title} className="p-5 rounded-2xl flex gap-4"
                        style={{ background: '#fafafa', border: '1.5px solid #f0f0f0' }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                          style={{ background: 'rgba(204,0,0,0.08)' }}>
                          {s.icon}
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-1" style={{ color: '#1a0000' }}>{s.title}</p>
                          <p className="text-xs leading-relaxed" style={{ color: '#777' }}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products */}
          {product.related?.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold mb-8" style={{ color: '#1a0000' }}>
                You May Also{' '}
                <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Like
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
