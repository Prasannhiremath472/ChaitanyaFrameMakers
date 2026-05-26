import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { sendOtp, verifyOtp, loginApi } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode]         = useState('otp');
  const [step, setStep]         = useState(0);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const { setAuth }             = useAuthStore();
  const navigate                = useNavigate();
  const [params]                = useSearchParams();
  const redirect                = params.get('redirect') || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOtp({ email, purpose: 'login' });
      toast.success('OTP sent to your email!');
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyOtp({ email, otp });
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! ✨`);
      navigate(redirect, { replace: true });
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginApi({ email, password });
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(redirect, { replace: true });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Sign In — Chaitanya FrameMakers</title></Helmet>
      <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#fff' }}>

        {/* Left – Image panel */}
        <div className="hidden lg:flex relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)' }}>
          <img
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=85"
            alt="Frames"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          />
          <div className="relative z-10 flex flex-col justify-between p-12 h-full">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="" className="w-12 h-12 object-contain rounded-xl"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} />
              <div>
                <p className="font-display text-lg font-bold text-white leading-none">Chaitanya</p>
                <p className="font-display text-lg font-bold leading-none" style={{ color: 'rgba(255,255,255,0.8)' }}>FrameMakers</p>
              </div>
            </Link>
            <div>
              <p className="text-white/80 text-sm uppercase tracking-widest font-semibold mb-4">Premium Photo Frames</p>
              <h2 className="font-display text-4xl font-bold text-white leading-tight mb-6">
                Turn Your Memories<br />Into Timeless Art
              </h2>
              <div className="flex flex-col gap-3">
                {['50,000+ happy customers', '500+ frame designs', 'Free shipping above ₹999'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80 text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right – Form */}
        <div className="flex items-center justify-center py-16 px-6">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-md">

            <div className="text-center mb-8">
              <div className="flex justify-center mb-5 lg:hidden">
                <img src="/logo.jpg" alt="" className="w-16 h-16 object-contain rounded-2xl"
                  style={{ boxShadow: '0 4px 20px rgba(139,0,0,0.2)' }} />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1a0000' }}>Welcome Back</h1>
              <p className="text-sm" style={{ color: '#888' }}>Sign in to your Chaitanya account</p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-2xl p-1 mb-8" style={{ background: '#f5f5f5' }}>
              {[['otp', '📱 OTP Login'], ['password', '🔑 Password']].map(([m, l]) => (
                <button key={m} onClick={() => { setMode(m); setStep(0); setOtp(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={mode === m ? {
                    background: '#fff',
                    color: '#CC0000',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  } : { color: '#888' }}>
                  {l}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'otp' ? (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {step === 0 ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: '#444' }}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" className="input-field" required autoFocus />
                      </div>
                      <button type="submit" disabled={loading} className="btn-brand w-full py-3.5 justify-center text-base disabled:opacity-60">
                        {loading ? '⏳ Sending OTP…' : '📱 Send OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="text-sm font-medium mb-2 block" style={{ color: '#444' }}>
                          OTP sent to <span style={{ color: '#CC0000' }}>{email}</span>
                        </label>
                        <input value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="6-digit OTP"
                          className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                          maxLength={6} autoFocus required />
                        <button type="button" onClick={handleSendOtp}
                          className="text-xs mt-2 transition-colors" style={{ color: '#CC0000' }}>
                          Resend OTP
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1 justify-center py-3">← Back</button>
                        <button type="submit" disabled={loading} className="btn-brand flex-1 justify-center py-3 disabled:opacity-60">
                          {loading ? '⏳ Verifying…' : '✓ Verify & Login'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <form onSubmit={handlePassword} className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: '#444' }}>Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" className="input-field" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: '#444' }}>Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Your password" className="input-field" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-brand w-full py-3.5 justify-center text-base disabled:opacity-60">
                      {loading ? '⏳ Signing in…' : '🔑 Sign In'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm mt-8" style={{ color: '#888' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold transition-colors" style={{ color: '#CC0000' }}>
                Sign up free →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
