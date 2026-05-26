import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getOrder } from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';

const STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STEP_MAP = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 };

const STATUS_STYLE = {
  pending:    { bg: '#FFF7ED', color: '#C2410C' },
  confirmed:  { bg: '#EFF6FF', color: '#1D4ED8' },
  processing: { bg: '#F5F3FF', color: '#7C3AED' },
  shipped:    { bg: '#ECFEFF', color: '#0E7490' },
  delivered:  { bg: '#F0FDF4', color: '#15803D' },
  cancelled:  { bg: '#FEF2F2', color: '#DC2626' },
  refunded:   { bg: '#FFF7ED', color: '#D97706' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="text-center py-24" style={{ background: '#fff' }}>
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a0000' }}>Order not found</h2>
      <Link to="/orders" className="btn-brand">Back to Orders</Link>
    </div>
  );

  const address = order.address_snapshot || {};
  const currentStep = STEP_MAP[order.status] ?? 0;
  const st = STATUS_STYLE[order.status] || { bg: '#f5f5f5', color: '#555' };

  const Card = ({ children, className = '' }) => (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  );

  return (
    <>
      <Helmet><title>Order #{order.order_number} — Chaitanya FrameMakers</title></Helmet>
      <div style={{ background: '#fafafa', minHeight: '100vh' }}>
        {/* Top nav bar */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-12 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Order Detail</p>
            <h1 className="font-display text-4xl font-bold text-white mb-3">
              Order #{order.order_number}
            </h1>
            <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.8)' }}>
              ← Back to My Orders
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Order meta row */}
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm" style={{ color: '#888' }}>Placed on {formatDate(order.created_at)}</p>
                <span className="px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: st.bg, color: st.color }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </Card>

            {/* Tracking stepper */}
            {order.status !== 'cancelled' && (
              <Card>
                <h3 className="font-bold text-base mb-6" style={{ color: '#1a0000' }}>Order Tracking</h3>
                <div className="flex items-start justify-between relative">
                  {/* Track line bg */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 z-0" style={{ background: '#f0f0f0' }} />
                  {/* Progress fill */}
                  <div className="absolute top-4 left-4 h-0.5 z-0 transition-all duration-700"
                    style={{
                      width: `${(currentStep / (STEPS.length - 1)) * 92}%`,
                      background: 'linear-gradient(135deg, #CC0000, #8B0000)',
                    }} />
                  {STEPS.map((s, i) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2" style={{ minWidth: '50px' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={i <= currentStep ? {
                          background: 'linear-gradient(135deg, #CC0000, #8B0000)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(204,0,0,0.4)',
                        } : { background: '#f0f0f0', color: '#bbb' }}>
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <span className="text-xs font-medium text-center hidden md:block"
                        style={{ color: i <= currentStep ? '#CC0000' : '#bbb' }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
                {order.tracking_number && (
                  <p className="text-sm mt-5" style={{ color: '#888' }}>
                    Tracking No:{' '}
                    <span className="font-mono font-semibold" style={{ color: '#1a0000' }}>{order.tracking_number}</span>
                  </p>
                )}
              </Card>
            )}

            {/* Order items */}
            <Card>
              <h3 className="font-bold text-base mb-5" style={{ color: '#1a0000' }}>Order Items</h3>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-4 items-center pb-4 last:pb-0"
                    style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0"
                      style={{ border: '1px solid #f0f0f0' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-snug mb-1" style={{ color: '#1a0000' }}>
                        {item.product_name}
                      </p>
                      <p className="text-xs" style={{ color: '#bbb' }}>SKU: {item.product_sku}</p>
                      <p className="text-xs" style={{ color: '#888' }}>Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                    </div>
                    <p className="font-bold text-sm shrink-0" style={{ color: '#CC0000' }}>
                      {formatPrice(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Delivery address */}
              <Card>
                <h3 className="font-bold text-base mb-4" style={{ color: '#1a0000' }}>Delivery Address</h3>
                <div className="space-y-1 text-sm" style={{ color: '#666' }}>
                  <p className="font-bold" style={{ color: '#1a0000' }}>{address.full_name}</p>
                  <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                  <p>{address.city}, {address.state} — {address.pincode}</p>
                  <p className="mt-2">📞 {address.phone}</p>
                </div>
              </Card>

              {/* Payment summary */}
              <Card>
                <h3 className="font-bold text-base mb-4" style={{ color: '#1a0000' }}>Payment Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between" style={{ color: '#666' }}>
                    <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between" style={{ color: '#16a34a' }}>
                      <span>Discount</span><span>−{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between" style={{ color: '#666' }}>
                    <span>Shipping</span>
                    <span style={{ color: !parseFloat(order.shipping_charge) ? '#16a34a' : '#1a0000', fontWeight: !parseFloat(order.shipping_charge) ? 700 : 400 }}>
                      {!parseFloat(order.shipping_charge) ? 'FREE' : formatPrice(order.shipping_charge)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2.5"
                    style={{ color: '#1a0000', borderTop: '1.5px solid #f0f0f0' }}>
                    <span>Total</span>
                    <span style={{ color: '#CC0000' }}>{formatPrice(order.total)}</span>
                  </div>
                  <p className="text-xs capitalize" style={{ color: '#aaa' }}>
                    Payment: {order.payment_status}
                  </p>
                  {order.razorpay_pay_id && (
                    <p className="text-xs font-mono" style={{ color: '#bbb' }}>{order.razorpay_pay_id}</p>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
