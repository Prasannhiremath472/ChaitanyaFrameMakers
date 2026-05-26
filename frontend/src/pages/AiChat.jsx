import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { aiRecommend } from '../services/api';
import { FEATURED_PRODUCTS, BESTSELLER_PRODUCTS } from '../data/dummyData';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const OCCASIONS = [
  { label: 'Birthday',    icon: '🎂' },
  { label: 'Anniversary', icon: '💍' },
  { label: 'Wedding',     icon: '💒' },
  { label: 'Festival',    icon: '🎉' },
  { label: 'Corporate',   icon: '💼' },
  { label: 'Kids',        icon: '🧸' },
  { label: 'Mother',      icon: '🌸' },
  { label: 'Father',      icon: '👔' },
];

const BUDGETS = [
  { label: 'Under ₹500',    value: 'low',  icon: '💚' },
  { label: '₹500 – ₹1,500', value: 'mid',  icon: '💛' },
  { label: 'Above ₹1,500',  value: 'high', icon: '❤️' },
];

export default function AiChat() {
  const [step,      setStep]      = useState(0);
  const [occasion,  setOccasion]  = useState('');
  const [budget,    setBudget]    = useState('');
  const [recipient, setRecipient] = useState('');
  const [results,   setResults]   = useState(null);
  const [message,   setMessage]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const { data } = await aiRecommend({ occasion, budget, recipient });
      if (data.recommendations?.length) {
        setResults(data.recommendations);
        setMessage(data.message);
      } else {
        // Fallback to dummy
        setResults([...FEATURED_PRODUCTS, ...BESTSELLER_PRODUCTS].slice(0, 8));
        setMessage(`Here are our top picks for a ${occasion} gift! Each one is crafted with love and perfect for making memories.`);
      }
      setStep(3);
    } catch {
      setResults([...FEATURED_PRODUCTS, ...BESTSELLER_PRODUCTS].slice(0, 8));
      setMessage(`Here are our top picks for a ${occasion} gift! Each one is crafted with love and perfect for making memories.`);
      setStep(3);
    } finally { setLoading(false); }
  };

  const reset = () => {
    setStep(0); setOccasion(''); setBudget(''); setRecipient(''); setResults(null);
  };

  return (
    <>
      <Helmet>
        <title>AI Gift Guide — Chaitanya FrameMakers</title>
        <meta name="description" content="Get personalised photo frame and gift recommendations from our AI assistant." />
      </Helmet>

      <div style={{ background: '#fff', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-16 px-6 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Personalised Gifting
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            AI Gift <span style={{ color: '#ffd700' }}>Recommender</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Answer 3 quick questions and get personalised frame &amp; gift suggestions curated just for you.
          </motion.p>
        </div>

        <div className="py-14 px-4">
          {step < 3 ? (
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="flex gap-2 mb-10">
                {['Occasion', 'Budget', 'Recipient'].map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className="h-1.5 rounded-full mb-1.5 transition-all duration-500"
                      style={{ background: i <= step ? 'linear-gradient(135deg, #CC0000, #8B0000)' : '#f0f0f0' }} />
                    <p className="text-xs font-medium text-center"
                      style={{ color: i <= step ? '#CC0000' : '#ccc' }}>{s}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0"
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                    <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#1a0000' }}>
                      What's the occasion?
                    </h2>
                    <p className="text-sm mb-8" style={{ color: '#888' }}>Select the event you're shopping for</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {OCCASIONS.map(o => (
                        <button key={o.label}
                          onClick={() => { setOccasion(o.label); setStep(1); }}
                          className="p-5 rounded-2xl text-center transition-all duration-200 group"
                          style={{
                            background: occasion === o.label ? 'rgba(204,0,0,0.08)' : '#fafafa',
                            border: occasion === o.label ? '2px solid #CC0000' : '2px solid #f0f0f0',
                          }}
                          onMouseEnter={e => { if (occasion !== o.label) e.currentTarget.style.borderColor = 'rgba(204,0,0,0.3)'; }}
                          onMouseLeave={e => { if (occasion !== o.label) e.currentTarget.style.borderColor = '#f0f0f0'; }}>
                          <div className="text-3xl mb-2">{o.icon}</div>
                          <p className="text-sm font-semibold" style={{ color: occasion === o.label ? '#CC0000' : '#555' }}>
                            {o.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                    <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#1a0000' }}>
                      What's your budget?
                    </h2>
                    <p className="text-sm mb-8" style={{ color: '#888' }}>We'll find the best options in your range</p>
                    <div className="space-y-3">
                      {BUDGETS.map(b => (
                        <button key={b.value}
                          onClick={() => { setBudget(b.value); setStep(2); }}
                          className="w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all duration-200"
                          style={{
                            background: budget === b.value ? 'rgba(204,0,0,0.06)' : '#fafafa',
                            border: budget === b.value ? '2px solid #CC0000' : '2px solid #f0f0f0',
                          }}
                          onMouseEnter={e => { if (budget !== b.value) e.currentTarget.style.borderColor = 'rgba(204,0,0,0.3)'; }}
                          onMouseLeave={e => { if (budget !== b.value) e.currentTarget.style.borderColor = '#f0f0f0'; }}>
                          <span className="text-2xl">{b.icon}</span>
                          <span className="font-bold text-lg" style={{ color: '#1a0000' }}>{b.label}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setStep(0)}
                      className="mt-6 text-sm transition-colors hover:text-red-700" style={{ color: '#aaa' }}>
                      ← Back
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                    <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#1a0000' }}>
                      Who's it for?
                    </h2>
                    <p className="text-sm mb-8" style={{ color: '#888' }}>Optional — helps us personalize your recommendations</p>
                    <input value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder="e.g. My wife, Best friend, Dad…"
                      className="input-field text-base mb-6"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleRecommend()} />
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">← Back</button>
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={handleRecommend} disabled={loading}
                        className="btn-brand flex-1 justify-center text-base disabled:opacity-60">
                        {loading ? '✨ Finding gifts…' : '✨ Get Recommendations'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-5xl mb-4">🎁</div>
                <h2 className="font-display text-3xl font-bold mb-3" style={{ color: '#1a0000' }}>
                  Perfect Picks for{' '}
                  <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {occasion}
                  </span>
                </h2>
                <p className="text-sm max-w-xl mx-auto mb-6" style={{ color: '#777' }}>{message}</p>
                <button onClick={reset} className="btn-outline text-sm">
                  ← Try Different Options
                </button>
              </div>

              {results?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {results.map((p, i) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-sm" style={{ color: '#aaa' }}>
                    No matching products found. Try a different occasion or budget.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
