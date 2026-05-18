import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { getProducts, getCategories, getBanners, getOffers } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategorySlider from '../components/CategorySlider';
import { staggerContainer, fadeUp, scaleIn } from '../utils/motion';

const HERO_SLIDES = [
  {
    title: 'Memories That',
    titleGold: 'Last Forever',
    sub: 'Premium photo frames crafted with love. Transform your cherished moments into timeless art.',
    cta: 'Shop Frames',
    ctaLink: '/products',
    bg: 'from-dark-950 via-dark-900 to-dark-950',
    accent: '🖼️',
  },
  {
    title: 'Personalized Gifts',
    titleGold: 'From the Heart',
    sub: 'Customize with your photos, names & messages. Perfect for every occasion and everyone you love.',
    cta: 'Customize Now',
    ctaLink: '/customize',
    bg: 'from-dark-950 via-[#1a1000] to-dark-950',
    accent: '✨',
  },
  {
    title: 'LED Frames That',
    titleGold: 'Glow With Love',
    sub: 'Illuminate your memories with our stunning LED frame collection. Adjustable brightness for any mood.',
    cta: 'Explore LED Frames',
    ctaLink: '/products?category=led-frames',
    bg: 'from-dark-950 via-[#0a0a1a] to-dark-950',
    accent: '💡',
  },
];

const STATS = [
  { label: 'Happy Customers', value: '50,000+', icon: '😊' },
  { label: 'Products',        value: '500+',    icon: '🖼️' },
  { label: 'Cities Served',   value: '200+',    icon: '🌍' },
  { label: 'Rating',          value: '4.9★',    icon: '⭐' },
];

export default function Home() {
  const [featured,    setFeatured]    = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [feat, best, trend, cats] = await Promise.all([
          getProducts({ featured: 1, limit: 8 }),
          getProducts({ bestseller: 1, limit: 8 }),
          getProducts({ trending: 1, limit: 8 }),
          getCategories(),
        ]);
        setFeatured(feat.data.data);
        setBestsellers(best.data.data);
        setTrending(trend.data.data);
        setCategories(cats.data.data);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>Chaitanya FrameMakers — Premium Photo Frames & Gift Articles</title>
        <meta name="description" content="Shop premium personalized photo frames, LED frames, canvas wall art, couple gifts and more. Custom gifting for every occasion." />
        <meta property="og:title"       content="Chaitanya FrameMakers — Premium Photo Frames" />
        <meta property="og:description" content="Transform memories into timeless art with our premium frames & gifts." />
      </Helmet>

      {/* ── Hero Slider ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="absolute inset-0 w-full h-full"
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className={`min-h-screen bg-gradient-to-br ${slide.bg} flex items-center`}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/3 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-3xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-6xl mb-6"
                    >
                      {slide.accent}
                    </motion.div>
                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
                      <span className="text-white">{slide.title}</span>
                      <br />
                      <span className="gold-text">{slide.titleGold}</span>
                    </h1>
                    <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
                      {slide.sub}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to={slide.ctaLink} className="btn-gold text-base px-8 py-4">
                          {slide.cta} →
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/ai-chat" className="btn-outline text-base px-8 py-4">
                          ✨ AI Gift Guide
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-dark-400 text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-gold-500 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="py-12 border-y border-gold-700/20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-display text-3xl font-bold gold-text mb-1">{s.value}</div>
                <div className="text-dark-400 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="py-20 px-0">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Browse By</p>
            <h2 className="section-title">Shop By <span className="gold-text">Category</span></h2>
          </motion.div>
        </div>
        <CategorySlider categories={categories} />
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <ProductSection
        title="Featured" titleGold="Collection"
        subtitle="Handpicked premium pieces for your home & gifting needs"
        products={featured}
        loading={loading}
        link="/products?featured=1"
      />

      {/* ── Promo Banner ──────────────────────────────────── */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold-800 via-gold-600 to-gold-800 p-12 text-center"
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 50%)' }} />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-black mb-4">
                Personalize Your Perfect Gift
              </h2>
              <p className="text-black/70 text-lg mb-8 max-w-xl mx-auto">
                Upload your photo and preview it in our premium frames instantly. 100% satisfaction guaranteed.
              </p>
              <Link to="/customize" className="inline-flex items-center gap-2 bg-black text-gold-400 font-bold px-10 py-4 rounded-2xl hover:bg-dark-900 transition-all hover:scale-105 text-lg">
                🎨 Start Customizing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────── */}
      <ProductSection
        title="Best" titleGold="Sellers"
        subtitle="Our most loved products, chosen by thousands of happy customers"
        products={bestsellers}
        loading={loading}
        link="/products?bestseller=1"
      />

      {/* ── Trending ──────────────────────────────────────── */}
      <ProductSection
        title="Trending" titleGold="Now"
        subtitle="What's hot this season — don't miss out"
        products={trending}
        loading={loading}
        link="/products?trending=1"
      />

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Why Us</p>
            <h2 className="section-title">The <span className="gold-text">Chaitanya</span> Promise</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎨', title: 'Premium Quality',     desc: 'Every frame is crafted with the finest materials — solid wood, crystal acrylic, UV-printed canvas.' },
              { icon: '⚡', title: 'Fast Delivery',       desc: 'Delivered in 5-7 business days across India. Express delivery available for urgent orders.' },
              { icon: '💛', title: '100% Satisfaction',   desc: 'Not happy? We\'ll replace or refund, no questions asked. Your smile is our priority.' },
              { icon: '🔒', title: 'Secure Payments',     desc: 'Pay securely via Razorpay — UPI, cards, wallets, net banking — all protected with SSL.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center group hover:border-gold-500/50 hover:shadow-gold transition-all duration-300"
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Testimonials</p>
            <h2 className="section-title">What Our <span className="gold-text">Customers</span> Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', loc: 'Mumbai', text: 'Ordered a customized LED frame for my parents\' anniversary. The quality blew me away — they absolutely loved it! Will order again.', rating: 5 },
              { name: 'Rahul Verma',  loc: 'Delhi',  text: 'Best corporate gifting experience. The engraved acrylic frames looked incredibly professional. All 50 gifts delivered on time!', rating: 5 },
              { name: 'Ananya Patel', loc: 'Bangalore', text: 'The canvas wall art of our family photo is just stunning. Colors are so vibrant and the print quality is exceptional. Highly recommend!', rating: 5 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:border-gold-500/30 transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <span key={s} className="text-gold-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-dark-500 text-xs">{t.loc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductSection({ title, titleGold, subtitle, products, loading, link }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-2">{title}</p>
            <h2 className="section-title">{title} <span className="gold-text">{titleGold}</span></h2>
            <p className="text-dark-400 mt-2 text-sm">{subtitle}</p>
          </div>
          <Link to={link} className="btn-outline text-sm shrink-0">
            View All →
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
