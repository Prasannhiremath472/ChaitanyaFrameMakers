const router = require('express').Router();
const db     = require('../models/db');

router.get('/', async (_req, res) => {
  const [blogs] = await db.query(
    `SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image, b.published_at, b.views,
            u.name AS author_name
     FROM blogs b LEFT JOIN users u ON b.author_id=u.id
     WHERE b.is_published=1 ORDER BY b.published_at DESC`
  );
  res.json({ success: true, data: blogs });
});

router.get('/:slug', async (req, res) => {
  const [[blog]] = await db.query(
    `SELECT b.*, u.name AS author_name FROM blogs b
     LEFT JOIN users u ON b.author_id=u.id
     WHERE b.slug=? AND b.is_published=1`,
    [req.params.slug]
  );
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
  await db.query('UPDATE blogs SET views=views+1 WHERE id=?', [blog.id]);
  res.json({ success: true, data: blog });
});

module.exports = router;
