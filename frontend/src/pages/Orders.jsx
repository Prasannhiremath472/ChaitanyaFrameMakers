import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getOrders } from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';

const STATUS_STYLE = {
  pending:    { bg: '#FFF7ED', color: '#C2410C', label: 'Pending' },
  confirmed:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Confirmed' },
  processing: { bg: '#F5F3FF', color: '#7C3AED', label: 'Processing' },
  shipped:    { bg: '#ECFEFF', color: '#0E7490', label: 'Shipped' },
  delivered:  { bg: '#F0FDF4', color: '#15803D', label: 'Delivered' },
  cancelled:  { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
  refunded:   { bg: '#FFF7ED', color: '#D97706', label: 'Refunded' },
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(r => setOrders(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>My Orders — Chaitanya FrameMakers</title></Helmet>
      <div style={{ background: '#fafafa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-12 px-6 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Account</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-white">
            My Orders
          </motion.h1>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-32 text-center">
              <div className="text-7xl mb-6">📦</div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#1a0000' }}>No orders yet</h2>
              <p className="text-sm mb-8" style={{ color: '#888' }}>Start shopping to see your orders here</p>
              <Link to="/products" className="btn-brand px-8">Browse Products</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const st = STATUS_STYLE[order.status] || { bg: '#f5f5f5', color: '#555', label: order.status };
                return (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link to={`/orders/${order.id}`}
                      className="block rounded-2xl p-6 transition-all duration-200 group"
                      style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.25)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(204,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-bold font-mono text-sm" style={{ color: '#1a0000' }}>
                              #{order.order_number}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-sm truncate mb-1" style={{ color: '#666' }}>
                            {order.product_names}
                          </p>
                          <p className="text-xs" style={{ color: '#bbb' }}>{formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-5 shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: '#CC0000' }}>
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-xs capitalize" style={{ color: '#aaa' }}>
                              {order.payment_status}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                            style={{ background: '#fafafa', color: '#ccc' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,0,0,0.1)'; e.currentTarget.style.color = '#CC0000'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = '#ccc'; }}>
                            →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
