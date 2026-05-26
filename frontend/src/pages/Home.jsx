import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategorySlider from '../components/CategorySlider';
import {
  FEATURED_PRODUCTS, BESTSELLER_PRODUCTS, TRENDING_PRODUCTS,
  DUMMY_CATEGORIES, DUMMY_REVIEWS,
} from '../data/dummyData';
import { formatPrice } from '../utils/helpers';
import slider1Image from '../Images/slider1image.png';

const HERO_SLIDES = [
  {
    badge: 'New Collection 2025',
    title: 'Memories That',
    titleAccent: 'Last Forever',
    sub: 'Premium photo frames crafted with love — transform your most cherished moments into timeless wall art.',
    cta: 'Shop Frames',
    ctaLink: '/products',
    ctaSecondary: 'AI Gift Guide',
    ctaSecondaryLink: '/ai-chat',
    image: slider1Image,
    tag: '🖼️  500+ Frame Designs',
  },
  {
    badge: 'Bestseller',
    title: 'LED Frames That',
    titleAccent: 'Glow With Love',
    sub: 'Illuminate your memories with warm LED lighting. Adjustable brightness, USB powered, magical all night.',
    cta: 'Shop LED Frames',
    ctaLink: '/products?category=led-frames',
    ctaSecondary: 'Customize Yours',
    ctaSecondaryLink: '/customize',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=85',
    tag: '💡  Warm White & RGB Options',
  },
  {
    badge: 'Most Popular',
    title: 'Canvas Art For',
    titleAccent: 'Your Walls',
    sub: 'Museum-grade Giclée canvas prints that stay vibrant for 75+ years. Any size, any photo, any wall.',
    cta: 'Shop Canvas Art',
    ctaLink: '/products?category=canvas-wall-art',
    ctaSecondary: 'Upload Your Photo',
    ctaSecondaryLink: '/customize',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85',
    tag: '🎨  Museum-Grade Giclée Print',
  },
];

const STATS = [
  { label: 'Happy Customers', value: '50,000+', icon: '😊', color: '#CC0000' },
  { label: 'Unique Products',  value: '500+',    icon: '🖼️', color: '#8B0000' },
  { label: 'Cities Served',    value: '200+',    icon: '🌍', color: '#CC0000' },
  { label: 'Avg. Rating',      value: '4.9 ★',   icon: '⭐', color: '#8B0000' },
];

const WHY_US = [
  { icon: '🎨', title: 'Premium Quality',   desc: 'Solid wood, optical acrylic, UV canvas — only the finest materials touch your memories.' },
  { icon: '⚡', title: 'Express Delivery',  desc: 'Standard 5-7 days or express 2-3 days. Real-time tracking from dispatch to your door.' },
  { icon: '✅', title: '100% Satisfaction', desc: 'Not happy? We replace or refund — no questions. Your smile is our only benchmark.' },
  { icon: '🔒', title: 'Secure Payments',   desc: 'Razorpay PCI-DSS certified checkout. UPI, cards, wallets — all 100% safe.' },
];

export default function Home() {
  const [featured,    setFeatured]    = useState(FEATURED_PRODUCTS);
  const [bestsellers, setBestsellers] = useState(BESTSELLER_PRODUCTS);
  const [trending,    setTrending]    = useState(TRENDING_PRODUCTS);
  const [categories,  setCategories]  = useState(DUMMY_CATEGORIES);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [feat, best, trend, cats] = await Promise.allSettled([
          getProducts({ featured: 1, limit: 8 }),
          getProducts({ bestseller: 1, limit: 8 }),
          getProducts({ trending: 1, limit: 8 }),
          getCategories(),
        ]);
        if (feat.status  === 'fulfilled' && feat.value.data.data?.length)  setFeatured(feat.value.data.data);
        if (best.status  === 'fulfilled' && best.value.data.data?.length)  setBestsellers(best.value.data.data);
        if (trend.status === 'fulfilled' && trend.value.data.data?.length) setTrending(trend.value.data.data);
        if (cats.status  === 'fulfilled' && cats.value.data.data?.length)  setCategories(cats.value.data.data);
      } catch {}
    };
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>Chaitanya FrameMakers — Premium Photo Frames & Gift Articles</title>
        <meta name="description" content="Shop premium personalized photo frames, LED frames, canvas wall art, couple gifts and more. Custom gifting for every occasion." />
      </Helmet>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh', background: '#fff' }}>
        <Swiper
          modules={[Autoplay, Pagination, EffectFade, Navigation]}
          effect="fade"
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="absolute inset-0 w-full h-full cfm-hero-swiper"
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="min-h-screen grid lg:grid-cols-2 items-center gap-0" style={{ background: '#fff' }}>
                {/* Text Side */}
                <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-32 lg:py-20 order-2 lg:order-1">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full w-fit mb-6"
                    style={{ background: 'rgba(204,0,0,0.08)', color: '#CC0000', border: '1px solid rgba(204,0,0,0.2)' }}>
                    ✦ {slide.badge}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                    className="font-display font-bold leading-tight mb-5"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#1a0000' }}>
                    {slide.title}<br />
                    <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {slide.titleAccent}
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#555' }}>
                    {slide.sub}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-4 mb-10">
                    <Link to={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', boxShadow: '0 8px 30px rgba(139,0,0,0.35)' }}>
                      {slide.cta} →
                    </Link>
                    <Link to={slide.ctaSecondaryLink}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:scale-105"
                      style={{ border: '2px solid #CC0000', color: '#CC0000', background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,0,0,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      {slide.ctaSecondary}
                    </Link>
                  </motion.div>
                  {/* Trust tag */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="flex items-center gap-2 text-sm" style={{ color: '#888' }}>
                    <span className="text-base">🔥</span>
                    <span>{slide.tag}</span>
                  </motion.div>
                </div>

                {/* Image Side */}
                <div className="relative order-1 lg:order-2 h-72 lg:h-screen overflow-hidden"
                  style={{ background: i === 0 ? '#fdf5f5' : 'transparent' }}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full"
                    style={{
                      objectFit: i === 0 ? 'contain' : 'cover',
                      filter: i === 0 ? 'none' : 'brightness(0.92)',
                      padding: i === 0 ? '24px' : '0',
                    }}
                  />
                  {/* Decorative overlay — skip for product images */}
                  {i !== 0 && (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.15) 0%, transparent 60%)' }} />
                  )}
                  {/* Floating badge */}
                  <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 px-5 py-4 rounded-2xl backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                      <span className="text-white text-lg">⭐</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#1a0000' }}>4.9 / 5.0 Rating</p>
                      <p className="text-xs" style={{ color: '#888' }}>50,000+ happy customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase" style={{ color: '#999' }}>Scroll</span>
          <div className="w-px h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #CC0000, transparent)' }} />
        </motion.div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className="py-10 border-y" style={{ background: '#fafafa', borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'rgba(204,0,0,0.08)' }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold font-display leading-none" style={{ color: '#CC0000' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <SectionHeader
            eyebrow="Browse By"
            title="Shop By Category"
            titleAccent="Category"
            sub="Explore our 16 curated collections — from LED frames to resin art"
          />
        </div>
        <CategorySlider categories={categories} />
      </section>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <ProductSection
        eyebrow="Handpicked For You"
        title="Featured" titleAccent="Collection"
        sub="Premium pieces chosen by our experts — the very best of Chaitanya"
        products={featured}
        loading={loading}
        link="/products?featured=1"
        bg="#fafafa"
      />

      {/* ── PROMO BANNER ───────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 50%, #8B0000 100%)' }}>
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
            {/* Grid */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 grid lg:grid-cols-2 items-center gap-10 p-10 md:p-16">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 text-white/80"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  ✦ Personalization Studio
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  Make It Yours,<br />Make It Memorable
                </h2>
                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
                  Upload your photo, choose your frame style, preview it live. Our customization tool makes it effortless. 100% satisfaction guaranteed.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/customize"
                    className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105"
                    style={{ background: '#fff', color: '#CC0000', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    🎨 Start Customizing
                  </Link>
                  <Link to="/products"
                    className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base text-white transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    Browse All →
                  </Link>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {[
                  { icon: '📸', label: 'Upload Your Photo' },
                  { icon: '🖼️', label: 'Pick Your Frame' },
                  { icon: '✏️', label: 'Add Name / Message' },
                  { icon: '🚚', label: 'Delivered To You' },
                ].map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: 'rgba(255,255,255,0.2)' }}>
                      {step.icon}
                    </div>
                    <span className="text-white text-sm font-semibold leading-tight">{step.label}</span>
                    <span className="text-xs text-white/50">Step {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BESTSELLERS ────────────────────────────────────── */}
      <ProductSection
        eyebrow="Customer Favourites"
        title="Best" titleAccent="Sellers"
        sub="The frames and gifts thousands of customers can't stop loving"
        products={bestsellers}
        loading={loading}
        link="/products?bestseller=1"
        bg="#fff"
      />

      {/* ── TRENDING ────────────────────────────────────────── */}
      <ProductSection
        eyebrow="What's Hot Right Now"
        title="Trending" titleAccent="Now"
        sub="Real-time picks — the products everyone is talking about this season"
        products={trending}
        loading={loading}
        link="/products?trending=1"
        bg="#fafafa"
      />

      {/* ── WHY CHOOSE US ───────────────────────────────────── */}
      <section className="py-24" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Why Us"
              title="The Chaitanya" titleAccent="Promise"
              sub="We don't just sell frames — we help you preserve memories. Here's how."
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl border transition-all duration-300 text-center"
                style={{ background: '#fff', border: '1.5px solid #f0f0f0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.25)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(204,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(204,0,0,0.08)' }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#1a0000' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#fafafa' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionHeader
              eyebrow="Real Reviews"
              title="What Our" titleAccent="Customers Say"
              sub="50,000+ customers trust Chaitanya FrameMakers. Here's what a few of them have to say."
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DUMMY_REVIEWS.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-7 rounded-3xl border transition-all duration-300"
                style={{ background: '#fff', border: '1.5px solid #f0f0f0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,0,0,0.2)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(204,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <span key={s} style={{ color: '#CC0000', fontSize: '16px' }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm leading-relaxed mb-6 italic" style={{ color: '#555' }}>"{t.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#1a0000' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#999' }}>📍 {t.loc}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(204,0,0,0.08)', color: '#CC0000' }}>
                      Verified ✓
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA STRIP ─────────────────────────────────── */}
      <section className="py-20 text-center px-6" style={{ background: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: '#CC0000' }}>Ready to Order?</p>
          <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1a0000' }}>
            Start Creating Your<br />
            <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Perfect Memory Frame
            </span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#777' }}>
            Free shipping above ₹999 · Delivered in 5-7 days · Easy returns · 100% satisfaction
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', boxShadow: '0 8px 30px rgba(139,0,0,0.3)' }}>
              🛍️ Shop Now
            </Link>
            <Link to="/ai-chat"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold text-base transition-all hover:scale-105"
              style={{ border: '2px solid #CC0000', color: '#CC0000' }}>
              ✨ Get AI Recommendations
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function SectionHeader({ eyebrow, title, titleAccent, sub }) {
  return (
    <div className="text-center">
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#CC0000' }}>
        ✦ {eyebrow}
      </motion.p>
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="font-display font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#1a0000' }}>
        {title}{' '}
        <span style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {titleAccent}
        </span>
      </motion.h2>
      {sub && (
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-base max-w-xl mx-auto" style={{ color: '#777' }}>
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function ProductSection({ eyebrow, title, titleAccent, sub, products, loading, link, bg }) {
  return (
    <section className="py-20" style={{ background: bg || '#fff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <SectionHeader eyebrow={eyebrow} title={title} titleAccent={titleAccent} sub={sub} />
          <Link to={link}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ border: '2px solid #CC0000', color: '#CC0000' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl animate-pulse" style={{ background: '#f0f0f0' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.06 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
