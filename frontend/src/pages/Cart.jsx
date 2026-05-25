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
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-8xl mb-6"
        >🛒</motion.div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Your Cart is Empty</h2>
        <p className="text-dark-400 mb-8">Looks like you haven't added any frames yet. Let's find something beautiful!</p>
        <Link to="/products" className="btn-gold text-base px-8">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>My Cart — Chaitanya FrameMakers</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title mb-10">
          My <span className="gold-text">Cart</span>
          <span className="ml-3 text-lg text-dark-400 font-sans font-normal">({items.length} items)</span>
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card-dark p-5 flex gap-5"
                >
                  <Link to={`/products/${item.slug}`} className="shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`}
                      className="text-white font-semibold hover:text-gold-400 transition-colors line-clamp-2 block mb-1">
                      {item.name}
                    </Link>
                    <p className="text-gold-500 font-bold text-lg mb-3">
                      {formatPrice(item.sale_price || item.price)}
                    </p>
                    {item.customization && (
                      <p className="text-dark-400 text-xs mb-3">Customized ✓</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-dark-700 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-white hover:bg-white/10 transition-colors">−</button>
                        <span className="px-4 py-2 text-white font-semibold border-x border-dark-700">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-white hover:bg-white/10 transition-colors">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-bold">
                          {formatPrice((item.sale_price || item.price) * item.quantity)}
                        </span>
                        <button onClick={() => removeItem(item.id)}
                          className="text-dark-500 hover:text-red-400 transition-colors text-xl" aria-label="Remove">
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-dark p-6 sticky top-24"
            >
              <h2 className="font-display text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-dark-300">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount ({coupon?.code})</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-dark-300">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-dark-500">Add {formatPrice(999 - subtotal + discount)} more for free shipping</p>
                )}
                <div className="border-t border-dark-800 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="gold-text">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              {!coupon ? (
                <div className="flex gap-2 mb-6">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input-field flex-1 py-2.5 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                  />
                  <button onClick={handleCoupon} disabled={validating}
                    className="btn-outline py-2.5 px-4 text-sm disabled:opacity-60 whitespace-nowrap">
                    {validating ? '…' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
                  <div>
                    <p className="text-green-400 font-semibold text-sm">{coupon.code}</p>
                    <p className="text-green-400/70 text-xs">Discount applied!</p>
                  </div>
                  <button onClick={removeCoupon} className="text-dark-500 hover:text-red-400 transition-colors">✕</button>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckout}
                className="btn-gold w-full py-4 text-base justify-center"
              >
                Proceed to Checkout →
              </motion.button>

              <div className="mt-4 flex items-center justify-center gap-2 text-dark-500 text-xs">
                <span>🔒</span>
                <span>Secured by Razorpay</span>
              </div>

              {/* Offers reminder */}
              <div className="mt-4 bg-gold-500/10 border border-gold-500/20 rounded-xl p-3">
                <p className="text-gold-400 text-xs font-semibold mb-1">💡 Available Coupons</p>
                <div className="space-y-1">
                  {['WELCOME10 — 10% off for new users', 'FLAT200 — ₹200 off above ₹999', 'LOVE25 — 25% off couple gifts'].map(c => (
                    <p key={c} className="text-dark-400 text-xs">{c}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
