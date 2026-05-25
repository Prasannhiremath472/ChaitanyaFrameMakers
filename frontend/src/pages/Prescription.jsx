import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { uploadPhoto } from '../services/api';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const FRAME_STYLES = [
  { id: 'led',      name: 'LED Glow Frame',     border: '4px solid #C9A84C', bg: '#0a0a0a', glow: 'shadow-[0_0_30px_#C9A84C]' },
  { id: 'wooden',   name: 'Royal Wooden Frame',  border: '8px solid #8B4513', bg: '#1a0a00', glow: '' },
  { id: 'acrylic',  name: 'Crystal Acrylic',     border: '3px solid rgba(200,200,255,0.5)', bg: '#0a0a1a', glow: '' },
  { id: 'minimal',  name: 'Minimal Black Frame',  border: '4px solid #333', bg: '#000', glow: '' },
];

export default function Prescription() {
  const [photo,       setPhoto]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [frameStyle,  setFrameStyle]  = useState(FRAME_STYLES[0]);
  const [caption,     setCaption]     = useState('');
  const [uploading,   setUploading]   = useState(false);
  const inputRef = useRef(null);
  const addItem  = useCartStore(s => s.addItem);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!photo) { toast.error('Please select a photo'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', photo);
      fd.append('product_id', '1'); // default LED frame
      const { data } = await uploadPhoto(fd);
      toast.success('Photo uploaded! Add to cart to complete your order.');
      addItem({
        id: `custom-${Date.now()}`,
        name: `Custom ${frameStyle.name}`,
        slug: 'eternal-love-led-frame',
        price: 999,
        sale_price: null,
        image: preview,
      }, 1, { photo_path: data.upload?.file_path, frame: frameStyle.id, caption });
    } catch { toast.error('Upload failed, please try again'); }
    finally { setUploading(false); }
  };

  return (
    <>
      <Helmet>
        <title>Customize Your Frame — Chaitanya FrameMakers</title>
        <meta name="description" content="Upload your photo and preview it live in our premium photo frames. Create a personalized keepsake." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-14">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="text-7xl mb-6">🎨</motion.div>
          <h1 className="section-title mb-4">Create Your <span className="gold-text">Custom Frame</span></h1>
          <p className="text-dark-300 text-lg max-w-xl mx-auto">
            Upload your favourite photo and see it come alive in our premium frames instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Controls */}
          <div className="space-y-8">
            {/* Upload */}
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-4">1. Upload Your Photo</h2>
              <div
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${preview ? 'border-gold-500 bg-gold-500/5' : 'border-dark-700 hover:border-gold-500/50 hover:bg-dark-900'}`}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto mb-4" />
                    <p className="text-green-400 font-semibold text-sm">✓ Photo uploaded</p>
                    <p className="text-dark-400 text-xs mt-1">Click to change</p>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-white font-semibold mb-2">Click to upload photo</p>
                    <p className="text-dark-400 text-sm">JPG, PNG, WEBP — up to 5MB</p>
                  </>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>
            </div>

            {/* Frame Style */}
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-4">2. Choose Frame Style</h2>
              <div className="grid grid-cols-2 gap-3">
                {FRAME_STYLES.map(f => (
                  <button key={f.id} onClick={() => setFrameStyle(f)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${frameStyle.id === f.id ? 'border-gold-500 bg-gold-500/10' : 'border-dark-700 hover:border-gold-500/30 bg-dark-900'}`}>
                    <div className="w-full h-8 rounded mb-2" style={{ border: f.border, background: f.bg }} />
                    <p className={`text-sm font-medium ${frameStyle.id === f.id ? 'text-gold-400' : 'text-white/70'}`}>{f.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-4">3. Add a Caption <span className="text-dark-500 font-sans font-normal text-sm">(optional)</span></h2>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="e.g. Forever in my heart ❤️"
                className="input-field"
                maxLength={60}
              />
              <p className="text-dark-500 text-xs mt-1">{caption.length}/60 characters</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUpload}
              disabled={!photo || uploading}
              className="btn-gold w-full py-4 text-base justify-center disabled:opacity-60"
            >
              {uploading ? '⏳ Uploading…' : '🛒 Add Custom Frame to Cart'}
            </motion.button>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-4">Live Preview</h2>
            <div className="sticky top-24">
              <div
                className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${frameStyle.glow}`}
                style={{ background: frameStyle.bg, border: frameStyle.border }}
              >
                {preview ? (
                  <div className="w-full h-full relative">
                    <img src={preview} alt="Your photo" className="w-full h-full object-cover" />
                    {caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white text-center font-display text-lg italic">{caption}</p>
                      </div>
                    )}
                    {frameStyle.id === 'led' && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ boxShadow: 'inset 0 0 30px rgba(201,168,76,0.3)' }} />
                    )}
                  </div>
                ) : (
                  <div className="text-center text-dark-600">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-sm">Upload a photo to preview</p>
                  </div>
                )}
              </div>
              <p className="text-center text-dark-400 text-sm mt-4">
                {frameStyle.name} Preview
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h2 className="section-title text-center mb-12">How It <span className="gold-text">Works</span></h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📸', title: 'Upload Photo',     desc: 'Choose your favourite memory' },
              { step: '02', icon: '🎨', title: 'Pick Frame Style', desc: 'LED, Wood, Acrylic & more' },
              { step: '03', icon: '🛒', title: 'Add to Cart',      desc: 'We confirm your customization' },
              { step: '04', icon: '📦', title: 'Delivered!',        desc: 'Handcrafted & delivered safely' },
            ].map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center">
                <div className="text-gold-600 font-bold text-xs tracking-widest mb-3">{s.step}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-dark-400 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
