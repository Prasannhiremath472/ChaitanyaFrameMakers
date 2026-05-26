import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { submitContact } from '../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function About() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(form);
      toast.success("Message sent! We'll get back within 24 hours. 😊");
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet>
        <title>About Us — Chaitanya FrameMakers</title>
        <meta name="description" content="Learn about Chaitanya FrameMakers — our story, mission, and commitment to premium quality photo frames and personalized gifts." />
      </Helmet>

      {/* Hero — consistent red gradient header */}
      <div style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }} className="py-16 px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Our Story
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Crafting Memories,{' '}
          <span style={{ color: '#ffd700' }}>One Frame at a Time</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          India's trusted source for premium personalized photo frames and gift articles since 2018.
        </motion.p>
      </div>

      {/* Stats */}
      <section className="py-16 px-6" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: '50,000+', l: 'Happy Customers', icon: '😊' },
              { v: '500+',    l: 'Products',         icon: '🖼️' },
              { v: '8 Years', l: 'of Craftsmanship', icon: '🏆' },
              { v: '4.9★',   l: 'Average Rating',   icon: '⭐' },
            ].map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-display text-3xl font-bold mb-1"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {s.v}
                </div>
                <div className="text-sm" style={{ color: '#888' }}>{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story — narrative */}
      <section className="py-24 px-6" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=85"
                alt="Our workshop"
                className="w-full rounded-3xl object-cover"
                style={{ aspectRatio: '4/3', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#CC0000' }}>✦ Who We Are</p>
              <h2 className="font-display text-4xl font-bold mb-6 leading-tight" style={{ color: '#1a0000' }}>
                Born From a Love of<br />Beautiful Memories
              </h2>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#666' }}>
                <p>Chaitanya FrameMakers was born in a small workshop in Pune in 2018, when our founder Chaitanya noticed that beautiful memories deserved equally beautiful frames — not the generic plastic ones from retail stores.</p>
                <p>Starting with hand-carved wooden frames, we grew into a full-service gifting brand offering LED frames, canvas wall art, resin art, corporate gifts, and fully personalized pieces crafted with love.</p>
                <p>Today, with 50,000+ happy customers across 200+ cities, we still hand-inspect every single product before it leaves our workshop. That personal touch is what makes us different.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#CC0000' }}>✦ What Drives Us</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: '#1a0000' }}>
              Our{' '}
              <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Values
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'Craftsmanship',   desc: 'Every frame is hand-inspected before shipping. We use only premium materials — solid wood, crystal acrylic, gallery-grade canvas.' },
              { icon: '✏️', title: 'Personalization', desc: 'We believe every gift should feel unique. Our customization options let you add your personal touch to every single product we make.' },
              { icon: '🌱', title: 'Sustainability',  desc: 'We source eco-friendly materials and use responsible packaging. Our wooden frames use FSC-certified timber from sustainable forests.' },
            ].map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl text-center transition-all duration-300"
                style={{ background: '#fff', border: '1.5px solid #f0f0f0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.25)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(204,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                  style={{ background: 'rgba(204,0,0,0.08)' }}>
                  {v.icon}
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#1a0000' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#CC0000' }}>✦ Contact Us</p>
            <h2 className="font-display text-4xl font-bold mb-3" style={{ color: '#1a0000' }}>
              Get in{' '}
              <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Touch
              </span>
            </h2>
            <p className="text-sm" style={{ color: '#888' }}>We'd love to hear from you. Send us a message and we'll respond within 24 hours!</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info cards */}
            <div className="space-y-4">
              {[
                { icon: '📞', title: 'Phone',    val: '+91 99999 99999',           href: 'tel:+919999999999' },
                { icon: '✉️', title: 'Email',    val: 'hello@chaitanyaframes.com', href: 'mailto:hello@chaitanyaframes.com' },
                { icon: '💬', title: 'WhatsApp', val: 'Chat with us on WhatsApp',  href: 'https://wa.me/919999999999' },
                { icon: '📍', title: 'Location', val: 'Pune, Maharashtra, India',  href: '#' },
              ].map(c => (
                <a key={c.title} href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-5 p-5 rounded-2xl transition-all duration-200 group"
                  style={{ border: '1.5px solid #f0f0f0', background: '#fafafa' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.25)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(204,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: 'rgba(204,0,0,0.08)' }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#aaa' }}>{c.title}</p>
                    <p className="font-semibold text-sm transition-colors group-hover:text-red-700" style={{ color: '#1a0000' }}>{c.val}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact form */}
            <form onSubmit={handleContact} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your Name *" className="input-field" required />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="Email Address *" className="input-field" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="Phone Number" className="input-field" />
                <input value={form.subject} onChange={e => set('subject', e.target.value)}
                  placeholder="Subject" className="input-field" />
              </div>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Your message *" rows={5} className="input-field resize-none" required />
              <button type="submit" disabled={loading}
                className="btn-brand w-full py-4 justify-center text-base disabled:opacity-60">
                {loading ? '⏳ Sending…' : '✉ Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
