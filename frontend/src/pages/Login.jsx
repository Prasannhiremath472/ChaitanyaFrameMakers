import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { sendOtp, verifyOtp, loginApi } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode]         = useState('otp'); // 'otp' | 'password'
  const [step, setStep]         = useState(0);     // 0=email, 1=otp
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
    if (!email) return;
    setLoading(true);
    try {
      await sendOtp({ email, purpose: 'login' });
      toast.success('OTP sent to your email!');
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
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
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        {/* Background decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gold-500/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <div className="glass-card p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
                <span className="text-black text-3xl font-bold">✦</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-dark-400 mt-2 text-sm">Sign in to your account</p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-dark-900 rounded-xl p-1 mb-8">
              {[['otp', '📱 OTP Login'], ['password', '🔑 Password']].map(([m, l]) => (
                <button key={m} onClick={() => { setMode(m); setStep(0); setOtp(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-gold-gradient text-black shadow-md' : 'text-dark-400 hover:text-white'}`}>
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
                        <label className="text-dark-300 text-sm mb-2 block">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com" className="input-field" required autoFocus />
                      </div>
                      <button type="submit" disabled={loading}
                        className="btn-gold w-full py-3.5 justify-center text-base disabled:opacity-60">
                        {loading ? '⏳ Sending OTP…' : '📱 Send OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="text-dark-300 text-sm mb-2 block">
                          Enter OTP sent to <span className="text-gold-400">{email}</span>
                        </label>
                        <input
                          value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="6-digit OTP"
                          className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                          maxLength={6} autoFocus required
                        />
                        <button type="button" onClick={handleSendOtp}
                          className="text-xs text-gold-500 hover:text-gold-400 mt-2 transition-colors">
                          Resend OTP
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(0)}
                          className="btn-outline flex-1 justify-center py-3">← Back</button>
                        <button type="submit" disabled={loading}
                          className="btn-gold flex-1 justify-center py-3 disabled:opacity-60">
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
                      <label className="text-dark-300 text-sm mb-2 block">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" className="input-field" required />
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm mb-2 block">Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Your password" className="input-field" required />
                    </div>
                    <button type="submit" disabled={loading}
                      className="btn-gold w-full py-3.5 justify-center text-base disabled:opacity-60">
                      {loading ? '⏳ Signing in…' : '🔑 Sign In'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-dark-400 text-sm mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                Sign up free →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
