const router = require('express').Router();
const db     = require('../models/db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  const [items] = await db.query(
    `SELECT w.id, w.added_at,
            p.id AS product_id, p.name, p.slug, p.price, p.sale_price,
            (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
     FROM wishlists w JOIN products p ON w.product_id=p.id
     WHERE w.user_id=?`,
    [req.user.id]
  );
  res.json({ success: true, data: items });
});

router.post('/', authenticate, async (req, res) => {
  const { product_id } = req.body;
  await db.query(
    'INSERT INTO wishlists (user_id, product_id) VALUES (?,?) ON DUPLICATE KEY UPDATE added_at=NOW()',
    [req.user.id, product_id]
  );
  res.status(201).json({ success: true, message: 'Added to wishlist' });
});

router.delete('/:product_id', authenticate, async (req, res) => {
  await db.query('DELETE FROM wishlists WHERE user_id=? AND product_id=?',
    [req.user.id, req.params.product_id]);
  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = router;
