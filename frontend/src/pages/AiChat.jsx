import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { aiRecommend } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Festival', 'Corporate', 'Kids', 'Mother', 'Father'];
const BUDGETS   = [
  { label: 'Under ₹500',   value: 'low' },
  { label: '₹500 - ₹1500', value: 'mid' },
  { label: 'Above ₹1500',  value: 'high' },
];

export default function AiChat() {
  const [step,    setStep]    = useState(0);
  const [occasion, setOccasion] = useState('');
  const [budget,  setBudget]  = useState('');
  const [recipient, setRecipient] = useState('');
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const { data } = await aiRecommend({ occasion, budget, recipient });
      setResults(data.recommendations);
      setMessage(data.message);
      setStep(3);
    } catch { toast.error('Recommendation failed, please try again.'); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep(0); setOccasion(''); setBudget(''); setRecipient(''); setResults(null); };

  return (
    <>
      <Helmet>
        <title>AI Gift Guide — Chaitanya FrameMakers</title>
        <meta name="description" content="Get personalized photo frame and gift recommendations from our AI assistant based on your occasion and budget." />
      </Helmet>

      <div className="min-h-screen py-16 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="text-7xl mb-6">✨</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            AI Gift <span className="gold-text">Recommendation</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-dark-300 text-lg">
            Answer 3 quick questions and get personalised frame & gift suggestions curated just for you.
          </motion.p>
        </div>

        {step < 3 ? (
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex gap-2 mb-10">
              {['Occasion', 'Budget', 'Recipient'].map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-gold-gradient' : 'bg-dark-800'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">What's the occasion?</h2>
                  <p className="text-dark-400 text-sm mb-8">Select the event you're shopping for</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {OCCASIONS.map(o => (
                      <button key={o} onClick={() => { setOccasion(o); setStep(1); }}
                        className={`glass-card p-5 text-center hover:border-gold-500/50 hover:shadow-gold transition-all duration-200 group ${occasion === o ? 'border-gold-500 shadow-gold' : ''}`}>
                        <div className="text-3xl mb-2">
                          {{'Birthday':'🎂','Anniversary':'💍','Wedding':'💒','Festival':'🎉','Corporate':'💼','Kids':'🧸','Mother':'🌸','Father':'👔'}[o]}
                        </div>
                        <p className="text-white text-sm font-medium group-hover:text-gold-400">{o}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">What's your budget?</h2>
                  <p className="text-dark-400 text-sm mb-8">We'll find the best options in your range</p>
                  <div className="space-y-4">
                    {BUDGETS.map(b => (
                      <button key={b.value} onClick={() => { setBudget(b.value); setStep(2); }}
                        className={`w-full glass-card p-5 text-left hover:border-gold-500/50 hover:shadow-gold transition-all flex items-center gap-4 ${budget === b.value ? 'border-gold-500' : ''}`}>
                        <span className="text-3xl">💰</span>
                        <span className="text-white font-semibold text-lg">{b.label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(0)} className="mt-6 text-dark-400 hover:text-gold-400 text-sm transition-colors">← Back</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">Who's it for?</h2>
                  <p className="text-dark-400 text-sm mb-8">Optional — helps us personalize better</p>
                  <input
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="e.g. My wife, Best friend, Dad…"
                    className="input-field text-lg mb-8"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleRecommend()}
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">← Back</button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleRecommend}
                      disabled={loading}
                      className="btn-gold flex-1 justify-center text-base disabled:opacity-60"
                    >
                      {loading ? '✨ Finding gifts…' : '✨ Get Recommendations'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="font-display text-3xl font-bold text-white mb-3">
                Perfect Picks for <span className="gold-text">{occasion}</span>
              </h2>
              <p className="text-dark-300 max-w-xl mx-auto">{message}</p>
              <button onClick={reset} className="btn-outline mt-6 text-sm">
                ← Try Different Options
              </button>
            </div>

            {results?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-dark-400">No matching products found. Try a different occasion or budget.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
