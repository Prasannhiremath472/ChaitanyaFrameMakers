import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboard } from '../../services/api';
import { formatPrice, formatDate, STATUS_COLORS } from '../../utils/helpers';

const COLORS = ['#C9A84C', '#8B6914', '#fde047', '#f59e0b', '#d97706'];

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <>
      <Helmet><title>Dashboard — Admin</title></Helmet>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 text-sm mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue',    value: formatPrice(stats.total_revenue || 0), icon: '💰', color: 'gold' },
          { label: 'Total Orders',     value: stats.total_orders || 0,               icon: '📦', color: 'blue' },
          { label: 'Total Customers',  value: stats.total_users || 0,                icon: '👥', color: 'purple' },
          { label: 'Active Products',  value: stats.total_products || 0,             icon: '🖼️', color: 'green' },
        ].map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card-dark p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{card.icon}</div>
              {card.label === 'Total Revenue' && stats.pending_orders > 0 && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  {stats.pending_orders} pending
                </span>
              )}
            </div>
            <div className="font-display text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-dark-400 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {stats.low_stock > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-red-400 font-semibold">{stats.low_stock} products are low on stock</p>
            <p className="text-red-400/70 text-sm">Review inventory to avoid stockouts</p>
          </div>
          <Link to="/admin/products" className="ml-auto btn-outline text-sm py-2">View →</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card-dark p-6">
          <h2 className="font-display text-lg font-bold text-white mb-6">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 12 }} />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A84C', borderRadius: '12px' }}
                labelStyle={{ color: '#C9A84C' }}
                formatter={v => [formatPrice(v), 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5}
                dot={{ fill: '#C9A84C', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#C9A84C' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Revenue Pie */}
        <div className="card-dark p-6">
          <h2 className="font-display text-lg font-bold text-white mb-6">Revenue by Category</h2>
          {data?.categoryRevenue?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.categoryRevenue} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                    {data.categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A84C', borderRadius: '12px' }}
                    formatter={v => [formatPrice(v), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {data.categoryRevenue.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-dark-400 text-xs flex-1 truncate">{c.name}</span>
                    <span className="text-white text-xs font-medium">{formatPrice(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-dark-500">No sales data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-gold-400 text-sm hover:text-gold-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-mono font-medium">#{order.order_number}</p>
                  <p className="text-dark-500 text-xs">{order.user_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'text-white/60 bg-white/10'}`}>
                    {order.status}
                  </span>
                  <span className="text-gold-400 font-bold text-sm">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Top Products</h2>
          </div>
          <div className="space-y-3">
            {(data?.topProducts || []).slice(0, 8).map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-2 border-b border-dark-800 last:border-0">
                <span className="text-gold-600 font-bold text-sm w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-dark-500 text-xs">{p.qty_sold} sold</p>
                </div>
                <span className="text-gold-400 font-bold text-sm shrink-0">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
