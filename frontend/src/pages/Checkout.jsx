import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { createOrder, createRazorpayOrder, verifyPayment } from '../services/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review', 'Payment'];

export default function Checkout() {
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India'
  });

  const { items, getSubtotal, getTotal, discount, coupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = subtotal - discount >= 999 ? 0 : 79;
  const total    = getTotal();

  useEffect(() => {
    if (user) setAddress(a => ({ ...a, full_name: user.name || '', phone: user.phone || '' }));
  }, [user]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const req = ['full_name','phone','line1','city','state','pincode'];
    for (const f of req) {
      if (!address[f]) { toast.error(`Please fill in ${f.replace('_',' ')}`); return; }
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, customization: i.customization })),
        address,
        coupon_code: coupon?.code || null,
        payment_method: 'razorpay',
      };

      const { data: orderData } = await createOrder(orderPayload);
      const orderId = orderData.order.id;

      const { data: rzpData } = await createRazorpayOrder({ order_id: orderId });

      const options = {
        key:         rzpData.key_id,
        amount:      rzpData.amount,
        currency:    rzpData.currency,
        name:        'Chaitanya FrameMakers',
        description: `Order #${orderData.order.order_number}`,
        order_id:    rzpData.razorpay_order_id,
        prefill: {
          name:    user?.name,
          email:   user?.email,
          contact: address.phone,
        },
        theme: { color: '#C9A84C' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              order_id:            orderId,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate(`/orders/${orderId}`);
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Order creation failed');
    }
  };

  return (
    <>
      <Helmet><title>Checkout — Chaitanya FrameMakers</title></Helmet>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="section-title mb-10">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${i <= step ? 'bg-gold-gradient text-black shadow-gold' : 'bg-dark-800 text-dark-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden md:block ${i <= step ? 'text-gold-400' : 'text-dark-500'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-3 ${i < step ? 'bg-gold-500' : 'bg-dark-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Step Content */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card-dark p-8">
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Delivery Address</h2>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-dark-300 text-sm mb-1.5 block">Full Name *</label>
                        <input value={address.full_name} onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                          placeholder="Your full name" className="input-field" required />
                      </div>
                      <div>
                        <label className="text-dark-300 text-sm mb-1.5 block">Phone Number *</label>
                        <input value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                          placeholder="10-digit mobile number" className="input-field" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm mb-1.5 block">Address Line 1 *</label>
                      <input value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                        placeholder="House/Flat No., Street, Area" className="input-field" required />
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm mb-1.5 block">Address Line 2</label>
                      <input value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                        placeholder="Landmark (optional)" className="input-field" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-dark-300 text-sm mb-1.5 block">City *</label>
                        <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                          placeholder="City" className="input-field" required />
                      </div>
                      <div>
                        <label className="text-dark-300 text-sm mb-1.5 block">State *</label>
                        <input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                          placeholder="State" className="input-field" required />
                      </div>
                      <div>
                        <label className="text-dark-300 text-sm mb-1.5 block">Pincode *</label>
                        <input value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
                          placeholder="6-digit pincode" className="input-field" required maxLength={6} />
                      </div>
                    </div>
                    <button type="submit" className="btn-gold w-full py-4 justify-center text-base mt-2">
                      Continue to Review →
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card-dark p-8 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold text-white">Review Order</h2>
                    <button onClick={() => setStep(0)} className="text-gold-400 text-sm hover:text-gold-300">Edit Address</button>
                  </div>
                  {/* Address preview */}
                  <div className="glass-card p-5 mb-6">
                    <p className="text-gold-400 text-xs font-semibold uppercase tracking-wide mb-2">Delivering to</p>
                    <p className="text-white font-semibold">{address.full_name}</p>
                    <p className="text-dark-300 text-sm">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                    <p className="text-dark-300 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-dark-300 text-sm">📞 {address.phone}</p>
                  </div>
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img src={item.image || '/placeholder.jpg'} alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-dark-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gold-400 font-bold text-sm">
                          {formatPrice((item.sale_price || item.price) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1 justify-center">← Back</button>
                  <button onClick={() => setStep(2)} className="btn-gold flex-1 justify-center">Continue to Payment →</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="card-dark p-8">
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Payment</h2>
                  <div className="glass-card p-6 mb-8 text-center">
                    <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="w-12 h-12 mx-auto mb-4" onError={e => e.target.style.display='none'} />
                    <p className="text-white font-semibold mb-2">Razorpay Secure Checkout</p>
                    <p className="text-dark-400 text-sm">Pay via UPI, Cards, Net Banking, Wallets & more</p>
                    <div className="flex justify-center gap-3 mt-4 text-2xl">
                      {['💳', '📱', '🏦', '👛'].map((i,k) => <span key={k}>{i}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">← Back</button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="btn-gold flex-1 justify-center text-base disabled:opacity-60 py-4"
                    >
                      {loading ? '⏳ Processing…' : `💳 Pay ${formatPrice(total)}`}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="card-dark p-6 sticky top-24">
              <h3 className="font-display text-lg font-bold text-white mb-5">Price Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon ({coupon?.code})</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-dark-300">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-dark-800 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="gold-text">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-xs text-dark-500">
                <p>🔒 SSL Encrypted & Secure</p>
                <p>✅ 100% Satisfaction Guaranteed</p>
                <p>↩️ 7-day easy returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
