import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSalesAnalytics, getTopProducts, getInventory } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export default function Analytics() {
  const [sales,     setSales]     = useState([]);
  const [products,  setProducts]  = useState([]);
  const [inventory, setInventory] = useState([]);
  const [period,    setPeriod]    = useState('30');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, p, inv] = await Promise.all([
          getSalesAnalytics(period),
          getTopProducts(),
          getInventory(),
        ]);
        setSales(s.data.data);
        setProducts(p.data.data);
        setInventory(inv.data.data);
      } finally { setLoading(false); }
    };
    load();
  }, [period]);

  const totalRev = sales.reduce((s, d) => s + parseFloat(d.revenue || 0), 0);
  const totalOrd = sales.reduce((s, d) => s + parseInt(d.orders || 0), 0);
  const outOfStock = inventory.filter(i => i.stock_status === 'out_of_stock').length;
  const lowStock   = inventory.filter(i => i.stock_status === 'low_stock').length;

  const customTooltipStyle = { background: '#1a1a1a', border: '1px solid #C9A84C', borderRadius: '12px' };

  return (
    <>
      <Helmet><title>Analytics — Admin</title></Helmet>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
          <p className="text-dark-400 text-sm mt-1">Business performance insights</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)} className="input-field w-auto">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: `Revenue (${period}d)`, value: formatPrice(totalRev), icon: '💰' },
          { label: `Orders (${period}d)`,  value: totalOrd,               icon: '📦' },
          { label: 'Out of Stock',         value: outOfStock,             icon: '🚫' },
          { label: 'Low Stock',            value: lowStock,               icon: '⚠️' },
        ].map((k, i) => (
          <div key={k.label} className="card-dark p-6">
            <div className="text-3xl mb-3">{k.icon}</div>
            <div className="font-display text-2xl font-bold text-white mb-1">{k.value}</div>
            <div className="text-dark-400 text-sm">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="card-dark p-6 mb-6">
        <h2 className="font-display text-lg font-bold text-white mb-6">Daily Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={sales}>
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
            <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: '#C9A84C' }}
              formatter={v => [formatPrice(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5}
              fill="url(#gold)" dot={false} activeDot={{ r: 5, fill: '#C9A84C' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card-dark p-6">
          <h2 className="font-display text-lg font-bold text-white mb-6">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={products.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#666" tick={{ fontSize: 11 }} tickFormatter={v => v} />
              <YAxis type="category" dataKey="name" stroke="#666" tick={{ fontSize: 10 }} width={120} />
              <Tooltip contentStyle={customTooltipStyle} labelStyle={{ color: '#C9A84C' }}
                formatter={v => [v, 'Units Sold']} />
              <Bar dataKey="qty_sold" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory */}
        <div className="card-dark p-6">
          <h2 className="font-display text-lg font-bold text-white mb-5">Inventory Status</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {inventory.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-dark-500 text-xs font-mono">{item.sku}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white text-sm font-bold">{item.stock}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.stock_status === 'out_of_stock' ? 'bg-red-500/20 text-red-400' :
                    item.stock_status === 'low_stock'    ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {item.stock_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
