const router  = require('express').Router();
const db      = require('../models/db');
const { authenticate } = require('../middleware/auth');

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  const [items] = await db.query(
    `SELECT ci.id, ci.quantity, ci.customization,
            p.id AS product_id, p.name, p.slug, p.price, p.sale_price, p.stock,
            (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
     FROM cart_items ci JOIN products p ON ci.product_id=p.id
     WHERE ci.user_id=?`,
    [req.user.id]
  );
  const total = items.reduce((s, i) => s + (parseFloat(i.sale_price || i.price) * i.quantity), 0);
  res.json({ success: true, data: items, total });
});

// POST /api/cart
router.post('/', authenticate, async (req, res) => {
  const { product_id, quantity = 1, customization } = req.body;
  if (!product_id) return res.status(400).json({ success: false, message: 'product_id required' });
  await db.query(
    `INSERT INTO cart_items (user_id, product_id, quantity, customization)
     VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity=quantity+?, customization=?`,
    [req.user.id, product_id, quantity,
     customization ? JSON.stringify(customization) : null,
     quantity, customization ? JSON.stringify(customization) : null]
  );
  res.status(201).json({ success: true, message: 'Added to cart' });
});

// PUT /api/cart/:id
router.put('/:id', authenticate, async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    await db.query('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Item removed' });
  }
  await db.query('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?',
    [quantity, req.params.id, req.user.id]);
  res.json({ success: true, message: 'Cart updated' });
});

// DELETE /api/cart/:id
router.delete('/:id', authenticate, async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Item removed' });
});

// DELETE /api/cart (clear cart)
router.delete('/', authenticate, async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE user_id=?', [req.user.id]);
  res.json({ success: true, message: 'Cart cleared' });
});

// POST /api/cart/validate-coupon
router.post('/validate-coupon', authenticate, async (req, res) => {
  const { code, subtotal } = req.body;
  const [[coupon]] = await db.query(
    `SELECT * FROM coupons WHERE code=? AND is_active=1
     AND (valid_from IS NULL OR valid_from <= CURDATE())
     AND (valid_until IS NULL OR valid_until >= CURDATE())
     AND (usage_limit IS NULL OR used_count < usage_limit)`,
    [code]
  );
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
  if (subtotal < coupon.min_order_value)
    return res.status(400).json({
      success: false,
      message: `Minimum order value ₹${coupon.min_order_value} required`,
    });
  const discount = coupon.discount_type === 'percent'
    ? Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || Infinity)
    : Math.min(coupon.discount_value, coupon.max_discount || coupon.discount_value);
  res.json({ success: true, coupon, discount });
});

module.exports = router;
