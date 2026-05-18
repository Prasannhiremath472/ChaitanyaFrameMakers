const router = require('express').Router();
const db     = require('../models/db');

router.get('/', async (_req, res) => {
  const [offers] = await db.query(
    `SELECT o.*, p.name AS product_name, c.name AS category_name
     FROM offers o
     LEFT JOIN products p ON o.product_id=p.id
     LEFT JOIN categories c ON o.category_id=c.id
     WHERE o.is_active=1
       AND (o.starts_at IS NULL OR o.starts_at <= NOW())
       AND (o.ends_at IS NULL OR o.ends_at >= NOW())
     ORDER BY o.created_at DESC`
  );
  res.json({ success: true, data: offers });
});

module.exports = router;
