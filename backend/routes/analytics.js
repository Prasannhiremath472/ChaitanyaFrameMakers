const router = require('express').Router();
const db     = require('../models/db');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);

router.get('/sales', async (req, res) => {
  const { period = '30' } = req.query;
  const [data] = await db.query(
    `SELECT DATE(created_at) AS date, SUM(total) AS revenue, COUNT(*) AS orders
     FROM orders WHERE payment_status='paid'
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(created_at) ORDER BY date`,
    [parseInt(period)]
  );
  res.json({ success: true, data });
});

router.get('/top-products', async (_req, res) => {
  const [data] = await db.query(
    `SELECT p.id, p.name, p.slug,
            SUM(oi.quantity) AS qty_sold,
            SUM(oi.total_price) AS revenue,
            (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
     FROM order_items oi JOIN products p ON oi.product_id=p.id
     JOIN orders o ON oi.order_id=o.id WHERE o.payment_status='paid'
     GROUP BY p.id ORDER BY qty_sold DESC LIMIT 20`
  );
  res.json({ success: true, data });
});

router.get('/customers', async (_req, res) => {
  const [data] = await db.query(
    `SELECT u.id, u.name, u.email,
            COUNT(o.id) AS total_orders,
            COALESCE(SUM(o.total),0) AS total_spent
     FROM users u LEFT JOIN orders o ON o.user_id=u.id AND o.payment_status='paid'
     WHERE u.role='customer'
     GROUP BY u.id ORDER BY total_spent DESC LIMIT 50`
  );
  res.json({ success: true, data });
});

router.get('/inventory', async (_req, res) => {
  const [data] = await db.query(
    `SELECT p.id, p.name, p.sku, p.stock, p.low_stock_alert,
            c.name AS category,
            CASE WHEN p.stock = 0 THEN 'out_of_stock'
                 WHEN p.stock <= p.low_stock_alert THEN 'low_stock'
                 ELSE 'in_stock' END AS stock_status
     FROM products p LEFT JOIN categories c ON p.category_id=c.id
     WHERE p.is_active=1 ORDER BY p.stock ASC`
  );
  res.json({ success: true, data });
});

module.exports = router;
