const router = require('express').Router();
const db     = require('../models/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');
const { createCategory, updateCategory } = require('../controllers/adminController');

router.get('/', async (_req, res) => {
  const [cats] = await db.query(
    'SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order');
  res.json({ success: true, data: cats });
});

router.get('/:slug', async (req, res) => {
  const [[cat]] = await db.query(
    'SELECT * FROM categories WHERE slug=? AND is_active=1', [req.params.slug]);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: cat });
});

router.post('/',   authenticate, isAdmin, uploadBanner.single('image'), createCategory);
router.put('/:id', authenticate, isAdmin, updateCategory);

module.exports = router;
