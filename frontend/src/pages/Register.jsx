import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { register, sendOtp, verifyOtp } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth }  = useAuthStore();
  const navigate     = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please verify your email.');
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyOtp({ email: form.email, otp, name: form.name, phone: form.phone });
      setAuth(data.user, data.token);
      toast.success(`Welcome to Chaitanya FrameMakers, ${data.user.name}! 🎉`);
      navigate('/', { replace: true });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Create Account — Chaitanya FrameMakers</title></Helmet>
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
                <span className="text-black text-3xl">✦</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">
                {step === 0 ? 'Create Account' : 'Verify Email'}
              </h1>
              <p className="text-dark-400 mt-2 text-sm">
                {step === 0 ? 'Join thousands of happy customers' : `OTP sent to ${form.email}`}
              </p>
            </div>

            {step === 0 ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Your full name" className="input-field" required autoFocus />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com" className="input-field" required />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Phone Number</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="10-digit mobile number" className="input-field" />
                </div>
                <div>
                  <label className="text-dark-300 text-sm mb-1.5 block">Password *</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Minimum 8 characters" className="input-field" required minLength={8} />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 justify-center text-base disabled:opacity-60 mt-2">
                  {loading ? '⏳ Creating account…' : '🚀 Create Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="text-dark-300 text-sm mb-2 block">Enter 6-digit OTP</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                    maxLength={6} autoFocus required />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 justify-center text-base disabled:opacity-60">
                  {loading ? '⏳ Verifying…' : '✓ Verify & Continue'}
                </button>
              </form>
            )}

            <p className="text-center text-dark-400 text-sm mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold">Sign in →</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
