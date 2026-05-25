import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getOrders } from '../services/api';
import { formatPrice, formatDate, STATUS_COLORS } from '../utils/helpers';

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>My Orders — Chaitanya FrameMakers</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="section-title mb-10">My <span className="gold-text">Orders</span></motion.h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">📦</div>
            <h2 className="text-white text-2xl font-bold mb-3">No orders yet</h2>
            <p className="text-dark-400 mb-8">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-gold">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/orders/${order.id}`}
                  className="card-dark p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gold-500/30 transition-all block group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-bold font-mono">#{order.order_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'text-white/60 bg-white/10'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm line-clamp-1 mb-1">{order.product_names}</p>
                    <p className="text-dark-500 text-xs">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-gold-400 font-bold text-lg">{formatPrice(order.total)}</p>
                      <p className="text-dark-500 text-xs capitalize">{order.payment_status}</p>
                    </div>
                    <span className="text-dark-600 group-hover:text-gold-400 transition-colors text-xl">→</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
