import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { validateCoupon } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, removeItem, updateQuantity, applyCoupon, removeCoupon,
          coupon, discount, getSubtotal, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [validating, setValidating] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal - discount >= 999 ? 0 : 79;
  const total    = getTotal();

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const { data } = await validateCoupon({ code: couponCode.toUpperCase(), subtotal });
      applyCoupon(data.coupon, data.discount);
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)} 🎉`);
    } catch {} finally { setValidating(false); }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex items-center justify-center" style={{ background: '#fff' }}>
      <div className="text-center max-w-md px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-8xl mb-6">🛒</motion.div>
        <h2 className="font-display text-3xl font-bold mb-3" style={{ color: '#1a0000' }}>
          Your Cart is Empty
        </h2>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: '#888' }}>
          Looks like you haven't added any frames yet. Let's find something beautiful for you!
        </p>
        <Link to="/products" className="btn-brand text-base px-8">Browse Products →</Link>
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>My Cart — Chaitanya FrameMakers</title></Helmet>
      <div style={{ background: '#fafafa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-12 px-6 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Shopping</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-white">
            My Cart{' '}
            <span className="text-xl font-sans font-normal" style={{ color: 'rgba(255,255,255,0.7)' }}>
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </motion.h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="rounded-2xl p-5 flex gap-5"
                    style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                    <Link to={`/products/${item.slug}`} className="shrink-0">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl transition-opacity hover:opacity-90"
                        style={{ border: '1px solid #f0f0f0' }} />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug}`}
                        className="font-semibold text-sm leading-snug line-clamp-2 block mb-1 transition-colors hover:text-red-700"
                        style={{ color: '#1a0000' }}>
                        {item.name}
                      </Link>
                      <p className="font-bold text-base mb-3" style={{ color: '#CC0000' }}>
                        {formatPrice(item.sale_price || item.price)}
                      </p>
                      {item.customization && (
                        <p className="text-xs mb-3" style={{ color: '#16a34a' }}>✓ Customized</p>
                      )}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Qty stepper */}
                        <div className="flex items-center rounded-xl overflow-hidden"
                          style={{ border: '1.5px solid #ebebeb' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50 text-lg font-medium"
                            style={{ color: '#555' }}>−</button>
                          <span className="w-10 text-center font-bold text-sm"
                            style={{ color: '#1a0000', borderLeft: '1px solid #ebebeb', borderRight: '1px solid #ebebeb', lineHeight: '36px' }}>
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50 text-lg font-medium"
                            style={{ color: '#555' }}>+</button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-base" style={{ color: '#1a0000' }}>
                            {formatPrice((item.sale_price || item.price) * item.quantity)}
                          </span>
                          <button onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                            style={{ color: '#ccc' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                            aria-label="Remove item">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-6 sticky top-24"
                style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

                <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#1a0000' }}>Order Summary</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between" style={{ color: '#666' }}>
                    <span>Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between" style={{ color: '#16a34a' }}>
                      <span>Coupon ({coupon?.code})</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between" style={{ color: '#666' }}>
                    <span>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#16a34a' : '#1a0000', fontWeight: shipping === 0 ? 700 : 400 }}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(204,0,0,0.06)', color: '#CC0000' }}>
                      Add {formatPrice(999 - subtotal + discount)} more for free shipping
                    </p>
                  )}
                  <div className="pt-3 flex justify-between font-bold text-lg"
                    style={{ borderTop: '1.5px solid #f0f0f0', color: '#1a0000' }}>
                    <span>Total</span>
                    <span style={{ color: '#CC0000' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                {!coupon ? (
                  <div className="flex gap-2 mb-5">
                    <input value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="input-field flex-1 py-2.5 text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleCoupon()} />
                    <button onClick={handleCoupon} disabled={validating}
                      className="btn-outline py-2.5 px-4 text-sm disabled:opacity-60 whitespace-nowrap">
                      {validating ? '…' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                    style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)' }}>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#16a34a' }}>{coupon.code}</p>
                      <p className="text-xs" style={{ color: '#16a34a', opacity: 0.7 }}>Discount applied ✓</p>
                    </div>
                    <button onClick={removeCoupon} className="text-sm transition-colors hover:text-red-500" style={{ color: '#aaa' }}>✕</button>
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout}
                  className="btn-brand w-full py-4 text-base justify-center">
                  Proceed to Checkout →
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: '#bbb' }}>
                  <span>🔒</span>
                  <span>100% Secure Checkout — Razorpay</span>
                </div>

                {/* Sample coupons hint */}
                <div className="mt-5 rounded-xl p-4" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#CC0000' }}>💡 Available Offers</p>
                  <div className="space-y-1.5">
                    {['WELCOME10 — 10% off (new users)', 'FLAT200 — ₹200 off above ₹999', 'LOVE25 — 25% off couple gifts'].map(c => (
                      <p key={c} className="text-xs" style={{ color: '#999' }}>{c}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
