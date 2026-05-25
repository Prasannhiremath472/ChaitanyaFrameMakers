import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
      toast.success('Message sent! We\'ll get back within 24 hours. 😊');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet>
        <title>About Us — Chaitanya FrameMakers</title>
        <meta name="description" content="Learn about Chaitanya FrameMakers — our story, mission, and commitment to premium quality photo frames and personalized gifts." />
      </Helmet>

      {/* Hero */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-500/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">Our Story</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            Crafting Memories<br /><span className="gold-text">One Frame at a Time</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-dark-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Founded with a passion for preserving life's most precious moments, Chaitanya FrameMakers
            has been India's trusted source for premium personalized photo frames and gift articles
            since 2018. Every piece we create is a labor of love.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-dark-900 border-y border-dark-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: '50,000+', l: 'Happy Customers' },
              { v: '500+',    l: 'Products' },
              { v: '8 Years', l: 'of Craftsmanship' },
              { v: '4.9★',   l: 'Average Rating' },
            ].map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="font-display text-4xl font-bold gold-text mb-2">{s.v}</div>
                <div className="text-dark-400 text-sm">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Our <span className="gold-text">Values</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💛', title: 'Craftsmanship',   desc: 'Every frame is hand-inspected for quality before shipping. We use only premium materials — solid wood, crystal acrylic, gallery-grade canvas.' },
              { icon: '🎨', title: 'Personalization', desc: 'We believe every gift should feel unique. Our customization options let you add your personal touch to every single product.' },
              { icon: '🌱', title: 'Sustainability',  desc: 'We source eco-friendly materials and use responsible packaging. Our wooden frames use FSC-certified timber from sustainable forests.' },
            ].map((v, i) => (
              <motion.div key={v.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center">
                <div className="text-5xl mb-5">{v.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Get in <span className="gold-text">Touch</span></h2>
            <p className="text-dark-400">We'd love to hear from you. Send us a message!</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-6">
              {[
                { icon: '📞', title: 'Phone',     val: '+91 99999 99999',           href: 'tel:+919999999999' },
                { icon: '✉️', title: 'Email',     val: 'hello@chaitanyaframes.com', href: 'mailto:hello@chaitanyaframes.com' },
                { icon: '💬', title: 'WhatsApp',  val: 'Chat with us',              href: 'https://wa.me/919999999999' },
                { icon: '📍', title: 'Location',  val: 'Pune, Maharashtra, India',  href: '#' },
              ].map(c => (
                <a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-5 glass-card p-5 hover:border-gold-500/30 transition-all group">
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <p className="text-dark-400 text-xs uppercase tracking-wide">{c.title}</p>
                    <p className="text-white font-semibold group-hover:text-gold-400 transition-colors">{c.val}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Form */}
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
              <button type="submit" disabled={loading} className="btn-gold w-full py-4 justify-center text-base disabled:opacity-60">
                {loading ? '⏳ Sending…' : '✉ Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
