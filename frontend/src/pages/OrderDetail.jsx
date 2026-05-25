import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getOrder } from '../services/api';
import { formatPrice, formatDate, STATUS_COLORS } from '../utils/helpers';

const STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STEP_MAP = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 };

export default function OrderDetail() {
  const { id }  = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  if (!order) return (
    <div className="text-center py-24">
      <h2 className="text-white text-2xl font-bold mb-4">Order not found</h2>
      <Link to="/orders" className="btn-gold">Back to Orders</Link>
    </div>
  );

  const address = order.address_snapshot || {};
  const currentStep = STEP_MAP[order.status] ?? 0;

  return (
    <>
      <Helmet><title>Order #{order.order_number} — Chaitanya FrameMakers</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="text-dark-400 hover:text-gold-400 transition-colors text-sm">
            ← My Orders
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="card-dark p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Order #{order.order_number}</h1>
              <p className="text-dark-400 text-sm mt-1">Placed on {formatDate(order.created_at)}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${STATUS_COLORS[order.status] || 'text-white/60 bg-white/10'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Tracking */}
          {order.status !== 'cancelled' && (
            <div className="card-dark p-6">
              <h3 className="font-display text-lg font-bold text-white mb-6">Order Tracking</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-dark-800 z-0" />
                <div className="absolute top-4 left-4 h-0.5 bg-gold-gradient z-0 transition-all duration-700"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%`, right: 'auto' }} />
                {STEPS.map((s, i) => (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? 'bg-gold-gradient text-black shadow-gold' : 'bg-dark-800 text-dark-500'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden md:block ${i <= currentStep ? 'text-gold-400' : 'text-dark-600'}`}>{s}</span>
                  </div>
                ))}
              </div>
              {order.tracking_number && (
                <p className="text-dark-400 text-sm mt-4">
                  Tracking No: <span className="text-white font-mono font-medium">{order.tracking_number}</span>
                </p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="card-dark p-6">
            <h3 className="font-display text-lg font-bold text-white mb-5">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-4 items-center border-b border-dark-800 pb-4 last:border-0 last:pb-0">
                  <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.product_name}</p>
                    <p className="text-dark-400 text-sm">SKU: {item.product_sku}</p>
                    <p className="text-dark-400 text-sm">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <p className="text-gold-400 font-bold">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="card-dark p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4">Delivery Address</h3>
              <div className="text-dark-300 text-sm space-y-1">
                <p className="text-white font-semibold">{address.full_name}</p>
                <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
                <p>📞 {address.phone}</p>
              </div>
            </div>

            {/* Price summary */}
            <div className="card-dark p-6">
              <h3 className="font-display text-lg font-bold text-white mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>−{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-dark-300">
                  <span>Shipping</span>
                  <span className={!parseFloat(order.shipping_charge) ? 'text-green-400' : ''}>
                    {!parseFloat(order.shipping_charge) ? 'FREE' : formatPrice(order.shipping_charge)}
                  </span>
                </div>
                <div className="border-t border-dark-800 pt-2 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="gold-text">{formatPrice(order.total)}</span>
                </div>
                <p className="text-dark-500 text-xs capitalize">Payment: {order.payment_status}</p>
                {order.razorpay_pay_id && (
                  <p className="text-dark-500 text-xs font-mono">{order.razorpay_pay_id}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
