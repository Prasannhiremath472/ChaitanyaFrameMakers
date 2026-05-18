require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again in 15 minutes.' },
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/otp/',  authLimiter);

// ── Static Files (Uploads) ────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/otp',         require('./routes/otp'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/categories',  require('./routes/categories'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/payment',     require('./routes/payment'));
app.use('/api/cart',        require('./routes/cart'));
app.use('/api/wishlist',    require('./routes/wishlist'));
app.use('/api/offers',      require('./routes/offers'));
app.use('/api/blogs',       require('./routes/blogs'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/misc',        require('./routes/prescription'));

// ── AI Gift Recommendation ────────────────────────────────────────────────
const db = require('./models/db');
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { occasion, budget, recipient, preferences } = req.body;
    const categoryMap = {
      birthday:    ['birthday-gifts','personalized-photo-frames','canvas-wall-art'],
      anniversary: ['anniversary-gifts','couple-gifts','led-frames'],
      wedding:     ['couple-gifts','canvas-wall-art','wooden-frames'],
      festival:    ['festival-gifts','home-decor','resin-art-gifts'],
      corporate:   ['corporate-gifts','acrylic-frames','glass-frames'],
      kids:        ['kids-gifts','personalized-photo-frames'],
      mother:      ['personalized-photo-frames','canvas-wall-art','home-decor'],
      father:      ['wooden-frames','corporate-gifts','photo-collage-frames'],
    };
    const slugs = categoryMap[occasion?.toLowerCase()] ||
                  ['personalized-photo-frames','led-frames','canvas-wall-art'];

    let priceFilter = '';
    const priceParams = [];
    if (budget) {
      const budgetMap = { low: 500, mid: 1500, high: 5000 };
      const max = budgetMap[budget] || parseInt(budget) || 2000;
      priceFilter = 'AND p.price <= ?';
      priceParams.push(max);
    }

    const placeholders = slugs.map(() => '?').join(',');
    const [products] = await db.query(
      `SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.short_desc,
              p.rating_avg, p.is_customizable,
              c.name AS category_name,
              (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
       FROM products p JOIN categories c ON p.category_id=c.id
       WHERE c.slug IN (${placeholders}) AND p.is_active=1
       ${priceFilter}
       ORDER BY p.rating_avg DESC, p.is_featured DESC LIMIT 8`,
      [...slugs, ...priceParams]
    );

    let message = `Here are my top picks for a ${occasion || 'special'} gift`;
    if (budget) message += ` within your budget`;
    message += '! Each of these is crafted with love and perfect for making memories.';

    res.json({ success: true, message, recommendations: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'AI recommendation failed' });
  }
});

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'Chaitanya FrameMakers API running', version: '1.0.0' })
);

// ── Banners Public Route ──────────────────────────────────────────────────
app.get('/api/banners', async (_req, res) => {
  const { position } = _req.query;
  const where = position ? 'WHERE position=? AND is_active=1' : 'WHERE is_active=1';
  const params = position ? [position] : [];
  const [banners] = await db.query(
    `SELECT * FROM banners ${where} ORDER BY sort_order`, params
  );
  res.json({ success: true, data: banners });
});

// ── Wishlist (publicly routable) ─────────────────────────────────────────
app.use('/api/wishlist', require('./routes/wishlist'));

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('💥 Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
