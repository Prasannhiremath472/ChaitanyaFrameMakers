import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { uploadPhoto } from '../services/api';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

// ─── Realistic Frame Definitions ──────────────────────────────────────────────
// Each frame uses layered box-shadow + border tricks to look like a real frame
const FRAME_STYLES = [
  {
    id: 'ornate-gold',
    name: 'Ornate Gold',
    emoji: '👑',
    price: 1499,
    tag: 'Most Popular',
    tagColor: '#CC0000',
    desc: 'Royal gold moulding with bevelled edge',
    // Card preview style
    cardBg: 'linear-gradient(145deg, #f5e642, #c9a84c, #f5d020, #b8860b)',
    cardShadow: '0 2px 0 #7a5c00, 0 4px 0 #5a4200, inset 0 1px 0 rgba(255,255,255,0.6)',
    // Live preview wrapper style
    outerBorder: '14px solid transparent',
    outerBorderImage: 'linear-gradient(145deg, #f5e642, #c9a84c, #f5d020, #b8860b) 1',
    frameStyle: {
      padding: '14px',
      background: 'linear-gradient(145deg, #f5e642 0%, #c9a84c 30%, #f5d020 60%, #b8860b 100%)',
      boxShadow: '0 0 0 2px #7a5c00, 0 0 0 4px #c9a84c, 0 8px 40px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.5)',
      borderRadius: '4px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 12px rgba(0,0,0,0.4)',
      borderRadius: '2px',
    },
    glowColor: 'rgba(201,168,76,0.25)',
  },
  {
    id: 'dark-wood',
    name: 'Royal Mahogany',
    emoji: '🪵',
    price: 1299,
    tag: 'Premium Wood',
    tagColor: '#7c3a1e',
    desc: 'Hand-carved solid mahogany with walnut finish',
    cardBg: 'linear-gradient(145deg, #5c2a0e, #8B4513, #6b3410, #4a1f08)',
    cardShadow: '0 2px 0 #2a0e00, 0 4px 0 #1a0800, inset 0 1px 0 rgba(255,180,100,0.3)',
    frameStyle: {
      padding: '16px',
      background: 'repeating-linear-gradient(90deg, #5c2a0e 0px, #8B4513 4px, #6b3410 8px, #4a1f08 12px, #5c2a0e 16px)',
      boxShadow: '0 0 0 2px #2a0e00, 0 0 0 5px #8B4513, 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 3px rgba(255,180,100,0.2)',
      borderRadius: '3px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
      borderRadius: '1px',
    },
    glowColor: 'rgba(139,69,19,0.2)',
  },
  {
    id: 'silver-metal',
    name: 'Brushed Silver',
    emoji: '✨',
    price: 1199,
    tag: 'Modern',
    tagColor: '#555',
    desc: 'Brushed aluminium with mirror-polished edge',
    cardBg: 'linear-gradient(145deg, #e8e8e8, #c0c0c0, #e8e8e8, #a0a0a0)',
    cardShadow: '0 2px 0 #808080, 0 4px 0 #606060, inset 0 1px 0 rgba(255,255,255,0.9)',
    frameStyle: {
      padding: '12px',
      background: 'linear-gradient(145deg, #f0f0f0 0%, #c0c0c0 40%, #e0e0e0 60%, #a8a8a8 100%)',
      boxShadow: '0 0 0 1px #888, 0 0 0 3px #d0d0d0, 0 8px 30px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.8)',
      borderRadius: '3px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
      borderRadius: '1px',
    },
    glowColor: 'rgba(192,192,192,0.3)',
  },
  {
    id: 'black-metal',
    name: 'Matte Black',
    emoji: '🖤',
    price: 999,
    tag: 'Minimalist',
    tagColor: '#222',
    desc: 'Sleek powder-coated black steel frame',
    cardBg: 'linear-gradient(145deg, #2a2a2a, #111, #333, #000)',
    cardShadow: '0 2px 0 #000, 0 4px 0 #000, inset 0 1px 0 rgba(255,255,255,0.1)',
    frameStyle: {
      padding: '12px',
      background: 'linear-gradient(145deg, #2a2a2a, #111111)',
      boxShadow: '0 0 0 1px #000, 0 0 0 3px #222, 0 8px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)',
      borderRadius: '2px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6)',
    },
    glowColor: 'rgba(0,0,0,0.15)',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold Luxe',
    emoji: '🌸',
    price: 1699,
    tag: 'Trending',
    tagColor: '#b5467a',
    desc: 'Elegant rose-gold finish with pearl inlay detail',
    cardBg: 'linear-gradient(145deg, #f4c2c2, #e8a0a0, #d4808e, #c06070)',
    cardShadow: '0 2px 0 #a04060, 0 4px 0 #803050, inset 0 1px 0 rgba(255,220,220,0.7)',
    frameStyle: {
      padding: '14px',
      background: 'linear-gradient(145deg, #f4c2c2 0%, #e8a0a0 30%, #d4808e 60%, #c06070 100%)',
      boxShadow: '0 0 0 2px #a04060, 0 0 0 4px #e8a0a0, 0 8px 35px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,220,220,0.6)',
      borderRadius: '4px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 12px rgba(160,64,96,0.3)',
      borderRadius: '2px',
    },
    glowColor: 'rgba(232,160,160,0.3)',
  },
  {
    id: 'vintage-white',
    name: 'Vintage Ivory',
    emoji: '🕊️',
    price: 1099,
    tag: 'Classic',
    tagColor: '#8B7355',
    desc: 'Distressed ivory with antique gold accent trim',
    cardBg: 'linear-gradient(145deg, #f5f0e8, #e8dcc8, #f0e8d8, #d8ccb4)',
    cardShadow: '0 2px 0 #b8a890, 0 4px 0 #9a8870, inset 0 1px 0 rgba(255,255,255,0.9)',
    frameStyle: {
      padding: '16px',
      background: 'linear-gradient(145deg, #f5f0e8 0%, #e8dcc8 40%, #f0e8d8 70%, #d8ccb4 100%)',
      boxShadow: '0 0 0 2px #b8a890, 0 0 0 5px #c9a84c, 0 8px 30px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.8)',
      borderRadius: '4px',
    },
    innerStyle: {
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
      borderRadius: '2px',
    },
    glowColor: 'rgba(200,168,80,0.15)',
  },
];

// ─── Frame Card Preview ───────────────────────────────────────────────────────
function FrameCard({ frame, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative text-left rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: selected ? '2.5px solid #CC0000' : '2px solid #f0f0f0',
        boxShadow: selected
          ? '0 0 0 3px rgba(204,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        background: '#fff',
      }}
    >
      {/* Frame artwork preview */}
      <div className="relative p-4 pb-2" style={{ background: '#fafafa' }}>
        {/* Realistic frame box */}
        <div className="mx-auto relative" style={{ width: 90, height: 72 }}>
          {/* Outer frame */}
          <div className="absolute inset-0 rounded" style={{
            background: frame.cardBg,
            boxShadow: frame.cardShadow,
          }} />
          {/* Inner mat */}
          <div className="absolute inset-[10px] rounded-sm" style={{
            background: '#e8e8e8',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {/* Simulated photo */}
            <div className="absolute inset-[4px] rounded-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
              }} />
              {/* Tiny person silhouette */}
              <svg viewBox="0 0 40 40" className="w-full h-full opacity-40">
                <ellipse cx="20" cy="12" rx="6" ry="7" fill="#666" />
                <path d="M8 38 Q20 22 32 38" fill="#666" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tag */}
        {frame.tag && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: frame.tagColor }}>
            {frame.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-1.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-base">{frame.emoji}</span>
          <p className="font-bold text-xs" style={{ color: selected ? '#CC0000' : '#1a0000' }}>{frame.name}</p>
        </div>
        <p className="text-[10px] leading-tight mb-1.5" style={{ color: '#888' }}>{frame.desc}</p>
        <p className="font-bold text-sm" style={{ color: '#CC0000' }}>₹{frame.price.toLocaleString('en-IN')}</p>
      </div>

      {/* Selected tick */}
      {selected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: '#CC0000' }}>
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.button>
  );
}

// ─── Realistic Live Preview Frame ─────────────────────────────────────────────
function LivePreview({ preview, frame, caption }) {
  return (
    <div className="relative flex items-center justify-center"
      style={{
        minHeight: 400,
        background: 'radial-gradient(ellipse at center, #f5f5f5 0%, #e8e8e8 100%)',
        borderRadius: 20,
        padding: 32,
      }}>

      {/* Ambient glow behind frame */}
      <div className="absolute inset-8 rounded-2xl transition-all duration-500"
        style={{ background: frame.glowColor, filter: 'blur(20px)' }} />

      {/* The actual frame wrapper */}
      <div className="relative z-10 w-full max-w-sm">
        <div style={{ ...frame.frameStyle, position: 'relative' }}>
          {/* Ornate corner decorations for gold/vintage frames */}
          {(frame.id === 'ornate-gold' || frame.id === 'vintage-white') && (
            <>
              {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} text-[10px] leading-none select-none`}
                  style={{ color: frame.id === 'ornate-gold' ? '#7a5c00' : '#b8a890', opacity: 0.7 }}>
                  ✦
                </div>
              ))}
            </>
          )}

          {/* Inner mat/bevel */}
          <div style={{
            ...frame.innerStyle,
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '4/5',
          }}>
            {preview ? (
              <>
                <img src={preview} alt="Your photo"
                  className="w-full h-full object-cover transition-all duration-500" />
                {/* LED glow overlay */}
                {frame.id === 'led-glow' && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 40px rgba(201,168,76,0.4)', mixBlendMode: 'screen' }} />
                )}
                {/* Caption overlay */}
                {caption && (
                  <div className="absolute bottom-0 left-0 right-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', padding: '24px 16px 12px' }}>
                    <p className="text-white text-center font-display text-base italic leading-snug"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                      "{caption}"
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)', minHeight: 280 }}>
                <div className="text-5xl opacity-30">🖼️</div>
                <p className="text-sm font-medium" style={{ color: '#aaa' }}>Upload photo to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Frame name label below */}
        <div className="text-center mt-4">
          <span className="text-sm font-bold px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(204,0,0,0.08)', color: '#CC0000' }}>
            {frame.emoji} {frame.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Prescription() {
  const [photo,      setPhoto]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [frameStyle, setFrameStyle] = useState(FRAME_STYLES[0]);
  const [caption,    setCaption]    = useState('');
  const [uploading,  setUploading]  = useState(false);
  const inputRef = useRef(null);
  const addItem  = useCartStore(s => s.addItem);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!photo) { toast.error('Please select a photo first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', photo);
      fd.append('product_id', '1');
      const { data } = await uploadPhoto(fd);
      toast.success('Added to cart! 🎉');
      addItem({
        id: `custom-${Date.now()}`,
        name: `Custom ${frameStyle.name}`,
        slug: 'custom-frame',
        price: frameStyle.price,
        sale_price: null,
        image: preview,
      }, 1, { photo_path: data.upload?.file_path, frame: frameStyle.id, caption });
    } catch {
      // Offline fallback — add to cart anyway
      addItem({
        id: `custom-${Date.now()}`,
        name: `Custom ${frameStyle.name}`,
        slug: 'custom-frame',
        price: frameStyle.price,
        sale_price: null,
        image: preview,
      }, 1, { frame: frameStyle.id, caption });
      toast.success('Added to cart! 🛒');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Customize Your Frame — Chaitanya FrameMakers</title>
        <meta name="description" content="Upload your photo and preview it live in our premium photo frames." />
      </Helmet>

      <div style={{ background: '#fff', minHeight: '100vh' }}>

        {/* ── Page Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #8B0000, #CC0000)' }} className="py-14 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Design Your <span style={{ color: '#ffd700' }}>Custom Frame</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-xl mx-auto">
            Upload a photo · Choose a frame · See it live — order in minutes
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* ── LEFT: Controls ── */}
            <div className="space-y-8">

              {/* Step 1 — Upload */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>1</div>
                    <h2 className="font-display text-lg font-bold" style={{ color: '#1a0000' }}>Upload Your Photo</h2>
                  </div>
                  <p className="text-xs ml-10" style={{ color: '#999' }}>JPG, PNG, WEBP · up to 10MB · High resolution recommended</p>
                </div>

                <div className="p-6">
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    className="cursor-pointer rounded-xl text-center transition-all duration-200"
                    style={{
                      border: preview ? '2px solid #CC0000' : '2px dashed #e0e0e0',
                      background: preview ? 'rgba(204,0,0,0.02)' : '#fafafa',
                      padding: preview ? '20px' : '40px 20px',
                    }}
                    onMouseEnter={e => !preview && (e.currentTarget.style.borderColor = '#CC0000')}
                    onMouseLeave={e => !preview && (e.currentTarget.style.borderColor = '#e0e0e0')}
                  >
                    {preview ? (
                      <div className="flex items-center gap-4">
                        <img src={preview} alt="Uploaded"
                          className="w-20 h-20 object-cover rounded-xl shrink-0"
                          style={{ border: '2px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <div className="text-left">
                          <p className="font-bold text-sm mb-0.5" style={{ color: '#16a34a' }}>✓ Photo uploaded</p>
                          <p className="text-xs" style={{ color: '#888' }}>{photo?.name}</p>
                          <p className="text-xs mt-2 font-medium" style={{ color: '#CC0000' }}>Click to change photo</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                          style={{ background: 'rgba(204,0,0,0.06)' }}>📸</div>
                        <p className="font-bold text-sm mb-1" style={{ color: '#1a0000' }}>Click or drag & drop your photo</p>
                        <p className="text-xs" style={{ color: '#bbb' }}>Supports JPG, PNG, WEBP</p>
                      </>
                    )}
                    <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </div>
                </div>
              </div>

              {/* Step 2 — Frame Style */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>2</div>
                    <h2 className="font-display text-lg font-bold" style={{ color: '#1a0000' }}>Choose Frame Style</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {FRAME_STYLES.map(f => (
                      <FrameCard key={f.id} frame={f} selected={frameStyle.id === f.id} onClick={() => setFrameStyle(f)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3 — Caption */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid #f0f0f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>3</div>
                    <h2 className="font-display text-lg font-bold" style={{ color: '#1a0000' }}>
                      Add Caption <span className="font-normal text-sm" style={{ color: '#bbb' }}>(optional)</span>
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <input
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder='e.g. "Forever in my heart ❤️"'
                    maxLength={60}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      border: '1.5px solid #e8e8e8',
                      background: '#fafafa',
                      color: '#1a0000',
                    }}
                    onFocus={e => e.target.style.borderColor = '#CC0000'}
                    onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                  />
                  <p className="text-xs mt-2 text-right" style={{ color: caption.length > 50 ? '#CC0000' : '#ccc' }}>
                    {caption.length}/60
                  </p>
                </div>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                disabled={!photo || uploading}
                className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all"
                style={{
                  background: !photo ? '#e0e0e0' : 'linear-gradient(135deg, #CC0000, #8B0000)',
                  color: !photo ? '#aaa' : '#fff',
                  boxShadow: !photo ? 'none' : '0 8px 28px rgba(139,0,0,0.35)',
                  cursor: !photo ? 'not-allowed' : 'pointer',
                }}>
                {uploading ? (
                  <><span className="animate-spin">⏳</span> Processing…</>
                ) : (
                  <><span>🛒</span> Add Custom Frame to Cart — ₹{frameStyle.price.toLocaleString('en-IN')}</>
                )}
              </motion.button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🔒', text: 'Secure Payment' },
                  { icon: '📦', text: '3-5 Day Delivery' },
                  { icon: '↩️', text: '7-Day Returns' },
                ].map(b => (
                  <div key={b.text} className="text-center py-3 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-xs font-medium" style={{ color: '#888' }}>{b.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Live Preview ── */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="font-display text-lg font-bold" style={{ color: '#1a0000' }}>Live Preview</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(204,0,0,0.08)', color: '#CC0000' }}>
                  Real-time
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={frameStyle.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}>
                  <LivePreview preview={preview} frame={frameStyle} caption={caption} />
                </motion.div>
              </AnimatePresence>

              {/* Frame specs */}
              <div className="rounded-2xl p-5" style={{ background: '#fafafa', border: '1.5px solid #f0f0f0' }}>
                <h3 className="font-bold text-sm mb-3" style={{ color: '#1a0000' }}>
                  {frameStyle.emoji} {frameStyle.name} — Details
                </h3>
                <div className="space-y-2 text-xs" style={{ color: '#666' }}>
                  <div className="flex justify-between">
                    <span>Material</span>
                    <span className="font-medium" style={{ color: '#333' }}>{frameStyle.desc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-bold" style={{ color: '#CC0000' }}>₹{frameStyle.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-medium" style={{ color: '#16a34a' }}>3–5 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customization</span>
                    <span className="font-medium" style={{ color: '#333' }}>Photo + Caption included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── How It Works ── */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#CC0000' }}>Simple Process</p>
              <h2 className="font-display text-3xl font-bold" style={{ color: '#1a0000' }}>
                How It <span style={{ color: '#CC0000' }}>Works</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', icon: '📸', title: 'Upload Photo',      desc: 'Choose any photo from your device — portrait, landscape or square' },
                { step: '02', icon: '🎨', title: 'Pick Frame Style',  desc: 'Choose from 6 premium frame styles with live preview' },
                { step: '03', icon: '🛒', title: 'Add to Cart',       desc: 'We confirm your customization before production starts' },
                { step: '04', icon: '📦', title: 'Delivered!',         desc: 'Handcrafted with care and delivered safely in 3–5 days' },
              ].map((s, i) => (
                <motion.div key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 text-center"
                  style={{ background: '#fff', border: '1.5px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#CC0000' }}>{s.step}</p>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ background: 'rgba(204,0,0,0.06)' }}>{s.icon}</div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#1a0000' }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
