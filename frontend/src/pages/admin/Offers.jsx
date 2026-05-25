import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getAdminCoupons, createCoupon, deleteCoupon, getAdminBanners, createBanner, deleteBanner,
         getAdminOffers, createOffer, getSubscribers, getMessages, markMessageRead } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminOffers() {
  const [tab,        setTab]        = useState('coupons');
  const [coupons,    setCoupons]    = useState([]);
  const [banners,    setBanners]    = useState([]);
  const [offers,     setOffers]     = useState([]);
  const [subscribers,setSubscribers]= useState([]);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [couponForm, setCouponForm] = useState({ code:'', description:'', discount_type:'percent', discount_value:'', min_order_value:'', max_discount:'', valid_until:'' });
  const [showCouponForm, setShowCouponForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'coupons')     { const r = await getAdminCoupons();   setCoupons(r.data.data); }
      if (tab === 'banners')     { const r = await getAdminBanners();   setBanners(r.data.data); }
      if (tab === 'offers')      { const r = await getAdminOffers();    setOffers(r.data.data); }
      if (tab === 'subscribers') { const r = await getSubscribers();    setSubscribers(r.data.data); }
      if (tab === 'messages')    { const r = await getMessages();       setMessages(r.data.data); }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [tab]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    await createCoupon(couponForm);
    toast.success('Coupon created!');
    setShowCouponForm(false);
    setCouponForm({ code:'', description:'', discount_type:'percent', discount_value:'', min_order_value:'', max_discount:'', valid_until:'' });
    loadData();
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await deleteCoupon(id);
    toast.success('Coupon deleted');
    loadData();
  };

  const handleMarkRead = async (id) => {
    await markMessageRead(id);
    setMessages(ms => ms.map(m => m.id === id ? { ...m, is_read: 1 } : m));
  };

  const setC = (k, v) => setCouponForm(f => ({ ...f, [k]: v }));

  const TABS = [
    { id: 'coupons', label: '🏷️ Coupons' },
    { id: 'banners', label: '🖼️ Banners' },
    { id: 'offers',  label: '🎁 Offers' },
    { id: 'subscribers', label: '✉️ Subscribers' },
    { id: 'messages', label: '💬 Messages' },
  ];

  return (
    <>
      <Helmet><title>Offers & Marketing — Admin</title></Helmet>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Marketing & Offers</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 rounded-xl p-1 mb-8 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-gold-gradient text-black shadow-md' : 'text-dark-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Coupons */}
      {tab === 'coupons' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-bold text-white">Coupons ({coupons.length})</h2>
            <button onClick={() => setShowCouponForm(!showCouponForm)} className="btn-gold text-sm">
              {showCouponForm ? 'Cancel' : '+ New Coupon'}
            </button>
          </div>

          <AnimatePresence>
            {showCouponForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateCoupon}
                className="card-dark p-6 mb-6 grid md:grid-cols-3 gap-4"
              >
                <input value={couponForm.code} onChange={e => setC('code', e.target.value.toUpperCase())}
                  placeholder="COUPON CODE *" className="input-field" required />
                <input value={couponForm.description} onChange={e => setC('description', e.target.value)}
                  placeholder="Description" className="input-field" />
                <select value={couponForm.discount_type} onChange={e => setC('discount_type', e.target.value)} className="input-field">
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
                <input type="number" value={couponForm.discount_value} onChange={e => setC('discount_value', e.target.value)}
                  placeholder="Discount Value *" className="input-field" required />
                <input type="number" value={couponForm.min_order_value} onChange={e => setC('min_order_value', e.target.value)}
                  placeholder="Min Order Value" className="input-field" />
                <input type="number" value={couponForm.max_discount} onChange={e => setC('max_discount', e.target.value)}
                  placeholder="Max Discount" className="input-field" />
                <div className="md:col-span-2">
                  <label className="text-dark-400 text-xs mb-1 block">Valid Until</label>
                  <input type="date" value={couponForm.valid_until} onChange={e => setC('valid_until', e.target.value)} className="input-field" />
                </div>
                <button type="submit" className="btn-gold self-end justify-center">Create Coupon</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="card-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  {['Code','Type','Discount','Min Order','Used','Valid Until','Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b border-dark-800/50">
                    <td className="px-5 py-4 font-mono text-gold-400 font-bold text-sm">{c.code}</td>
                    <td className="px-5 py-4 text-dark-300 text-sm capitalize">{c.discount_type}</td>
                    <td className="px-5 py-4 text-white text-sm">
                      {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </td>
                    <td className="px-5 py-4 text-dark-400 text-sm">₹{c.min_order_value}</td>
                    <td className="px-5 py-4 text-dark-400 text-sm">{c.used_count}/{c.usage_limit || '∞'}</td>
                    <td className="px-5 py-4 text-dark-400 text-sm">{c.valid_until ? formatDate(c.valid_until) : '—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDeleteCoupon(c.id)}
                        className="text-red-400 hover:text-red-300 text-xs border border-red-500/20 px-3 py-1.5 rounded-lg transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banners */}
      {tab === 'banners' && (
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-6">Banners ({banners.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map(b => (
              <div key={b.id} className="card-dark p-4">
                <div className="aspect-video bg-dark-800 rounded-xl mb-3 overflow-hidden">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                </div>
                <p className="text-white font-semibold text-sm mb-1">{b.title}</p>
                <p className="text-dark-400 text-xs mb-2">Position: {b.position}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={async () => { await deleteBanner(b.id); loadData(); }}
                    className="text-red-400 text-xs hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers */}
      {tab === 'subscribers' && (
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-6">Newsletter Subscribers ({subscribers.length})</h2>
          <div className="card-dark overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  {['Email','Status','Subscribed On'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-dark-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.map(s => (
                  <tr key={s.id} className="border-b border-dark-800/50">
                    <td className="px-5 py-4 text-white text-sm">{s.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${s.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-400 text-sm">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages */}
      {tab === 'messages' && (
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-6">Contact Messages ({messages.length})</h2>
          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`card-dark p-5 ${!m.is_read ? 'border-gold-500/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-semibold">{m.name}</span>
                      <span className="text-dark-400 text-sm">{m.email}</span>
                      {!m.is_read && <span className="w-2 h-2 bg-gold-400 rounded-full" />}
                    </div>
                    {m.subject && <p className="text-gold-400 text-sm font-medium mb-2">{m.subject}</p>}
                    <p className="text-dark-300 text-sm leading-relaxed">{m.message}</p>
                    <p className="text-dark-500 text-xs mt-2">{formatDate(m.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!m.is_read && (
                      <button onClick={() => handleMarkRead(m.id)}
                        className="text-xs text-gold-400 hover:text-gold-300 border border-gold-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                        Mark Read
                      </button>
                    )}
                    <a href={`mailto:${m.email}?subject=Re: ${m.subject || 'Your enquiry'}`}
                      className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-lg text-center">
                      Reply
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {tab === 'offers' && (
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-6">Active Offers ({offers.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map(o => (
              <div key={o.id} className="card-dark p-5">
                <p className="text-white font-semibold mb-1">{o.title}</p>
                <p className="text-gold-400 text-lg font-bold mb-2">{o.discount}% OFF</p>
                {o.product_name && <p className="text-dark-400 text-xs">Product: {o.product_name}</p>}
                {o.category_name && <p className="text-dark-400 text-xs">Category: {o.category_name}</p>}
                <p className="text-dark-500 text-xs mt-2">{o.ends_at ? `Ends: ${formatDate(o.ends_at)}` : 'No end date'}</p>
              </div>
            ))}
            {offers.length === 0 && (
              <div className="col-span-3 text-center py-12 text-dark-500">No active offers</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
