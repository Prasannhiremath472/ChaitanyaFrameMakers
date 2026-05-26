import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { createOrder, createRazorpayOrder, verifyPayment } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review', 'Payment'];

const Label = ({ children }) => (
  <label className="text-sm font-medium block mb-1.5" style={{ color: '#555' }}>{children}</label>
);

export default function Checkout() {
  const [step,    setStep]    = useState(0);
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

  const setAddr = (key, val) => setAddress(a => ({ ...a, [key]: val }));

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const required = ['full_name', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of required) {
      if (!address[f]) { toast.error(`Please fill in ${f.replace('_', ' ')}`); return; }
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
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#CC0000' },
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

  const SummaryCard = () => (
    <div className="rounded-2xl p-6 sticky top-24"
      style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <h3 className="font-bold text-base mb-5" style={{ color: '#1a0000' }}>Price Summary</h3>
      <div className="space-y-3 text-sm">
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
        <div className="flex justify-between font-bold text-lg pt-3"
          style={{ borderTop: '1.5px solid #f0f0f0', color: '#1a0000' }}>
          <span>Total</span>
          <span style={{ color: '#CC0000' }}>{formatPrice(total)}</span>
        </div>
      </div>
      <div className="mt-5 space-y-1.5 text-xs" style={{ color: '#bbb' }}>
        <p>🔒 SSL Encrypted & Secure</p>
        <p>✅ 100% Satisfaction Guaranteed</p>
        <p>↩️ 7-day easy returns</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout — Chaitanya FrameMakers</title></Helmet>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div style={{ background: '#fafafa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-12 px-6 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>🔒 SSL Secured</p>
          <h1 className="font-display text-4xl font-bold text-white">Secure Checkout</h1>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                    style={i <= step ? {
                      background: 'linear-gradient(135deg, #CC0000, #8B0000)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(139,0,0,0.35)',
                    } : { background: '#f0f0f0', color: '#bbb' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-sm font-semibold hidden md:block transition-colors"
                    style={{ color: i <= step ? '#CC0000' : '#ccc' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-12 md:w-20 h-0.5 mx-3 rounded-full transition-all"
                    style={{ background: i < step ? '#CC0000' : '#f0f0f0' }} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">

              {/* STEP 0 — Address */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="rounded-2xl p-8"
                    style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#1a0000' }}>Delivery Address</h2>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <input value={address.full_name}
                            onChange={e => setAddr('full_name', e.target.value)}
                            placeholder="Your full name" className="input-field" required />
                        </div>
                        <div>
                          <Label>Phone Number *</Label>
                          <input value={address.phone}
                            onChange={e => setAddr('phone', e.target.value)}
                            placeholder="10-digit mobile" className="input-field" required />
                        </div>
                      </div>
                      <div>
                        <Label>Address Line 1 *</Label>
                        <input value={address.line1}
                          onChange={e => setAddr('line1', e.target.value)}
                          placeholder="House/Flat No., Street, Area" className="input-field" required />
                      </div>
                      <div>
                        <Label>Address Line 2</Label>
                        <input value={address.line2}
                          onChange={e => setAddr('line2', e.target.value)}
                          placeholder="Landmark (optional)" className="input-field" />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>City *</Label>
                          <input value={address.city}
                            onChange={e => setAddr('city', e.target.value)}
                            placeholder="City" className="input-field" required />
                        </div>
                        <div>
                          <Label>State *</Label>
                          <input value={address.state}
                            onChange={e => setAddr('state', e.target.value)}
                            placeholder="State" className="input-field" required />
                        </div>
                        <div>
                          <Label>Pincode *</Label>
                          <input value={address.pincode}
                            onChange={e => setAddr('pincode', e.target.value)}
                            placeholder="6-digit pincode" className="input-field" required maxLength={6} />
                        </div>
                      </div>
                      <button type="submit" className="btn-brand w-full py-4 justify-center text-base mt-2">
                        Continue to Review →
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* STEP 1 — Review */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="rounded-2xl p-8 mb-5"
                    style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-bold" style={{ color: '#1a0000' }}>Review Order</h2>
                      <button onClick={() => setStep(0)} className="text-sm font-medium transition-colors hover:text-red-700"
                        style={{ color: '#CC0000' }}>Edit Address</button>
                    </div>

                    {/* Address preview */}
                    <div className="rounded-xl p-4 mb-6" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#CC0000' }}>📍 Delivering to</p>
                      <p className="font-bold text-sm" style={{ color: '#1a0000' }}>{address.full_name}</p>
                      <p className="text-sm" style={{ color: '#666' }}>
                        {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                      </p>
                      <p className="text-sm" style={{ color: '#666' }}>
                        {address.city}, {address.state} — {address.pincode}
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#888' }}>📞 {address.phone}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center pb-3"
                          style={{ borderBottom: '1px solid #f8f8f8' }}>
                          <img src={getImageUrl(item.image)} alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl"
                            style={{ border: '1px solid #f0f0f0' }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-1" style={{ color: '#1a0000' }}>{item.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-sm shrink-0" style={{ color: '#CC0000' }}>
                            {formatPrice((item.sale_price || item.price) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-outline flex-1 justify-center">← Back</button>
                    <button onClick={() => setStep(2)} className="btn-brand flex-1 justify-center">Continue to Payment →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="rounded-2xl p-8"
                    style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#1a0000' }}>Payment</h2>

                    <div className="rounded-2xl p-8 text-center mb-8"
                      style={{ background: '#fafafa', border: '1.5px solid #f0f0f0' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                        style={{ background: 'rgba(204,0,0,0.08)' }}>
                        🔒
                      </div>
                      <p className="font-bold text-base mb-1" style={{ color: '#1a0000' }}>Razorpay Secure Checkout</p>
                      <p className="text-sm" style={{ color: '#888' }}>Pay via UPI, Cards, Net Banking, Wallets & more</p>
                      <div className="flex justify-center gap-3 mt-4 text-2xl">
                        {['💳', '📱', '🏦', '👛'].map((i, k) => <span key={k}>{i}</span>)}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">← Back</button>
                      <motion.button whileTap={{ scale: 0.96 }}
                        onClick={handlePlaceOrder} disabled={loading}
                        className="btn-brand flex-1 justify-center text-base disabled:opacity-60 py-4">
                        {loading ? '⏳ Processing…' : `💳 Pay ${formatPrice(total)}`}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Summary sidebar */}
            <div>
              <SummaryCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
