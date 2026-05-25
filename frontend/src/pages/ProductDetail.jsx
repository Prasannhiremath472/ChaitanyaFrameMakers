import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProduct, addReview } from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/ProductCard';
import { formatPrice, getDiscount, getImageUrl, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]           = useState(1);
  const [tab, setTab]           = useState('description');
  const [review, setReview]     = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [zoom, setZoom]         = useState(false);
  const [zoomPos, setZoomPos]   = useState({ x: 50, y: 50 });

  const addItem = useCartStore(s => s.addItem);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(r => setProduct(r.data.data))
      .catch(() => setProduct(null))
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className={`skeleton h-8 rounded-xl ${i > 1 ? 'w-3/4' : ''}`} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🖼️</div>
        <h2 className="text-white text-2xl font-bold mb-2">Product Not Found</h2>
        <Link to="/products" className="btn-gold mt-4">Browse All Products</Link>
      </div>
    </div>
  );

  const images   = product.images?.length ? product.images : [{ image_url: '/placeholder.jpg', alt_text: product.name }];
  const discount = getDiscount(product.price, product.sale_price);
  const inStock  = product.stock > 0;

  return (
    <>
      <Helmet>
        <title>{product.meta_title || `${product.name} — Chaitanya FrameMakers`}</title>
        <meta name="description" content={product.meta_desc || product.short_desc} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-dark-400 mb-8">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-gold-400 transition-colors">Shop</Link>
          {product.category_name && (
            <><span>›</span>
            <Link to={`/products?category=${product.category_slug}`} className="hover:text-gold-400 transition-colors">
              {product.category_name}
            </Link></>
          )}
          <span>›</span>
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image with zoom */}
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-dark-900 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <img
                src={getImageUrl(images[activeImg]?.image_url)}
                alt={images[activeImg]?.alt_text || product.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${zoom ? 'scale-150' : 'scale-100'}`}
                style={zoom ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                  -{discount}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gold-500 shadow-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-2">{product.category_name}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-3">{product.name}</h1>
              {/* Rating */}
              {product.rating_count > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${s <= Math.round(product.rating_avg) ? 'text-gold-400' : 'text-dark-700'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-dark-400 text-sm">{product.rating_avg} ({product.rating_count} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="font-display text-4xl font-bold gold-text">
                {formatPrice(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <span className="text-dark-500 text-xl line-through mb-1">{formatPrice(product.price)}</span>
              )}
              {discount > 0 && (
                <span className="text-green-400 text-sm font-semibold mb-1">Save {discount}%</span>
              )}
            </div>

            <p className="text-dark-300 leading-relaxed">{product.short_desc}</p>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-3">
              {product.material && (
                <div className="glass-card p-3 text-sm">
                  <span className="text-dark-400">Material: </span>
                  <span className="text-white font-medium">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="glass-card p-3 text-sm">
                  <span className="text-dark-400">Size: </span>
                  <span className="text-white font-medium">{product.dimensions}</span>
                </div>
              )}
              {product.brand && (
                <div className="glass-card p-3 text-sm">
                  <span className="text-dark-400">Brand: </span>
                  <span className="text-white font-medium">{product.brand}</span>
                </div>
              )}
              {product.sku && (
                <div className="glass-card p-3 text-sm">
                  <span className="text-dark-400">SKU: </span>
                  <span className="text-white font-medium">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className={`flex items-center gap-2 text-sm font-medium ${inStock ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </div>

            {/* Qty + Add to Cart */}
            {inStock && (
              <div className="flex gap-4">
                <div className="flex items-center border border-dark-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-white hover:bg-white/10 transition-colors font-bold text-lg">−</button>
                  <span className="px-5 py-3 text-white font-semibold border-x border-dark-700">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-3 text-white hover:bg-white/10 transition-colors font-bold text-lg">+</button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="btn-gold flex-1 text-base"
                >
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
            <div className="flex flex-wrap gap-4 pt-2">
              {['🚚 Free shipping above ₹999', '🔒 Secure checkout', '↩️ Easy returns', '⭐ Quality guarantee'].map(b => (
                <span key={b} className="text-xs text-dark-400">{b}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex gap-1 border-b border-dark-800 mb-8">
            {['description', 'reviews', 'shipping'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${tab === t ? 'border-gold-500 text-gold-400' : 'border-transparent text-dark-400 hover:text-white'}`}
              >
                {t === 'reviews' ? `Reviews (${product.reviews?.length || 0})` : t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="prose prose-invert max-w-none text-dark-300 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br>') || product.short_desc }} />
              </motion.div>
            )}

            {tab === 'reviews' && (
              <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-8">
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map(r => (
                      <div key={r.id} className="glass-card p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{r.user_name || r.guest_name || 'Customer'}</p>
                            <p className="text-dark-500 text-xs">{formatDate(r.created_at)}</p>
                          </div>
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={s <= r.rating ? 'text-gold-400' : 'text-dark-700'}>★</span>
                            ))}
                          </div>
                        </div>
                        {r.title && <p className="text-white font-medium mb-2">{r.title}</p>}
                        <p className="text-dark-400 text-sm leading-relaxed">{r.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-dark-400 text-center py-8">No reviews yet. Be the first to review!</p>
                )}

                {/* Write review */}
                <div className="glass-card p-8">
                  <h3 className="font-display text-xl font-bold text-white mb-6">Write a Review</h3>
                  <form onSubmit={handleReview} className="space-y-4">
                    <div>
                      <label className="text-dark-300 text-sm mb-2 block">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                            className={`text-3xl transition-transform hover:scale-110 ${s <= review.rating ? 'text-gold-400' : 'text-dark-700'}`}>
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      value={review.title}
                      onChange={e => setReview(r => ({ ...r, title: e.target.value }))}
                      placeholder="Review title"
                      className="input-field"
                    />
                    <textarea
                      value={review.body}
                      onChange={e => setReview(r => ({ ...r, body: e.target.value }))}
                      placeholder="Share your experience..."
                      rows={4}
                      className="input-field resize-none"
                      required
                    />
                    <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {tab === 'shipping' && (
              <motion.div key="ship" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4 text-dark-300">
                {[
                  { icon: '🚚', title: 'Free Shipping', desc: 'Free shipping on orders above ₹999. Flat ₹79 below.' },
                  { icon: '📅', title: 'Delivery Time', desc: '5-7 business days standard. Express 2-3 days available.' },
                  { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy for manufacturing defects.' },
                  { icon: '📦', title: 'Safe Packaging', desc: 'Premium bubble-wrap packaging ensures safe delivery.' },
                ].map(s => (
                  <div key={s.title} className="glass-card p-5 flex gap-4">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <p className="text-white font-semibold mb-1">{s.title}</p>
                      <p className="text-dark-400 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {product.related?.length > 0 && (
          <section>
            <h2 className="section-title mb-8">You May Also <span className="gold-text">Like</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
