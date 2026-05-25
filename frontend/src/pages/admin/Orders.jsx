import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getAdminOrders, updateOrderStatus } from '../../services/api';
import { formatPrice, formatDate, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminOrders({ page, limit: 20, search: search || undefined, status: status || undefined });
      setOrders(data.data);
      setTotal(data.pagination.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search, status]);

  const handleStatus = async (id, newStatus, tracking) => {
    await updateOrderStatus(id, { status: newStatus, tracking_number: tracking });
    toast.success('Order updated!');
    load();
    setSelected(null);
  };

  return (
    <>
      <Helmet><title>Orders — Admin</title></Helmet>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Orders</h1>
          <p className="text-dark-400 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by order # or email…" className="input-field max-w-xs" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                {['Order','Customer','Date','Total','Status','Payment','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="skeleton h-10 rounded-xl" /></td></tr>
                ))
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-dark-800/50 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-white font-medium">#{order.order_number}</td>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm">{order.user_name || 'Guest'}</p>
                    <p className="text-dark-500 text-xs">{order.user_email}</p>
                  </td>
                  <td className="px-5 py-4 text-dark-400 text-sm">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-4 text-gold-400 font-bold text-sm">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'text-white/60 bg-white/10'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${order.payment_status === 'paid' ? 'text-green-400' : order.payment_status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(order)}
                      className="px-3 py-1.5 text-xs border border-dark-700 text-white/70 hover:text-gold-400 hover:border-gold-500 rounded-lg transition-all">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Modal */}
      {selected && (
        <OrderModal order={selected} onClose={() => setSelected(null)} onUpdate={handleStatus} />
      )}
    </>
  );
}

function OrderModal({ order, onClose, onUpdate }) {
  const [status,   setStatus]   = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number || '');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card-dark w-full max-w-md p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">Order #{order.order_number}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-dark-300 text-sm mb-1.5 block">Order Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
              {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-dark-300 text-sm mb-1.5 block">Tracking Number</label>
            <input value={tracking} onChange={e => setTracking(e.target.value)}
              placeholder="Enter tracking number" className="input-field" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
            <button onClick={() => onUpdate(order.id, status, tracking)}
              className="btn-gold flex-1 justify-center">Update Order</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
