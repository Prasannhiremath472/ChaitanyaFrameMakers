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
      <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#fff' }}>

        {/* Left panel */}
        <div className="hidden lg:flex relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)' }}>
          <img src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85"
            alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />
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
              <h2 className="font-display text-4xl font-bold text-white leading-tight mb-6">
                Join 50,000+<br />Happy Customers
              </h2>
              <div className="flex flex-col gap-3">
                {['Exclusive member discounts', 'Order tracking & history', 'Personalised recommendations', 'Early access to new products'].map(t => (
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
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md">

            <div className="text-center mb-8">
              <div className="flex justify-center mb-5 lg:hidden">
                <img src="/logo.jpg" alt="" className="w-16 h-16 object-contain rounded-2xl"
                  style={{ boxShadow: '0 4px 20px rgba(139,0,0,0.2)' }} />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#1a0000' }}>
                {step === 0 ? 'Create Account' : 'Verify Email'}
              </h1>
              <p className="text-sm" style={{ color: '#888' }}>
                {step === 0 ? 'Join thousands of happy customers' : `Enter the OTP sent to ${form.email}`}
              </p>
            </div>

            {step === 0 ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#444' }}>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Your full name" className="input-field" required autoFocus />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#444' }}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com" className="input-field" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#444' }}>Phone Number</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="10-digit mobile number" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#444' }}>Password *</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Minimum 8 characters" className="input-field" required minLength={8} />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-brand w-full py-3.5 justify-center text-base disabled:opacity-60 mt-2">
                  {loading ? '⏳ Creating account…' : '🚀 Create Account'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#444' }}>6-digit OTP</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="000000"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                    maxLength={6} autoFocus required />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-brand w-full py-3.5 justify-center text-base disabled:opacity-60">
                  {loading ? '⏳ Verifying…' : '✓ Verify & Continue'}
                </button>
              </form>
            )}

            <p className="text-center text-sm mt-8" style={{ color: '#888' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#CC0000' }}>Sign in →</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
