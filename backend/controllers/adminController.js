const db = require('../models/db');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [[revenue]]  = await db.query(
      `SELECT COALESCE(SUM(total),0) AS total_revenue,
              COUNT(*) AS total_orders,
              COALESCE(AVG(total),0) AS avg_order_value
       FROM orders WHERE payment_status='paid'`
    );
    const [[users]]    = await db.query('SELECT COUNT(*) AS total_users FROM users WHERE role="customer"');
    const [[products]] = await db.query('SELECT COUNT(*) AS total_products FROM products WHERE is_active=1');
    const [[pending]]  = await db.query(`SELECT COUNT(*) AS count FROM orders WHERE status='pending'`);
    const [[lowStock]] = await db.query('SELECT COUNT(*) AS count FROM products WHERE stock <= low_stock_alert AND is_active=1');

    const [recentOrders] = await db.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name AS user_name
       FROM orders o LEFT JOIN users u ON o.user_id=u.id
       ORDER BY o.created_at DESC LIMIT 10`
    );

    const [monthlyRevenue] = await db.query(
      `SELECT DATE_FORMAT(created_at,'%Y-%m') AS month,
              SUM(total) AS revenue, COUNT(*) AS orders
       FROM orders WHERE payment_status='paid'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month`
    );

    const [topProducts] = await db.query(
      `SELECT p.name, SUM(oi.quantity) AS qty_sold, SUM(oi.total_price) AS revenue
       FROM order_items oi JOIN products p ON oi.product_id=p.id
       JOIN orders o ON oi.order_id=o.id WHERE o.payment_status='paid'
       GROUP BY p.id ORDER BY qty_sold DESC LIMIT 10`
    );

    const [categoryRevenue] = await db.query(
      `SELECT c.name, SUM(oi.total_price) AS revenue
       FROM order_items oi
       JOIN products p ON oi.product_id=p.id
       JOIN categories c ON p.category_id=c.id
       JOIN orders o ON oi.order_id=o.id
       WHERE o.payment_status='paid'
       GROUP BY c.id ORDER BY revenue DESC`
    );

    res.json({
      success: true,
      data: {
        stats: {
          total_revenue: revenue.total_revenue,
          total_orders:  revenue.total_orders,
          avg_order:     revenue.avg_order_value,
          total_users:   users.total_users,
          total_products:products.total_products,
          pending_orders:pending.count,
          low_stock:     lowStock.count,
        },
        recentOrders,
        monthlyRevenue,
        topProducts,
        categoryRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Dashboard error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where  = []; const params = [];
  if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM users ${w}`, params);
  const [users] = await db.query(
    `SELECT id, name, email, phone, role, is_verified, created_at FROM users
     ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );
  res.json({ success: true, data: users, pagination: { total, page: parseInt(page) } });
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const { role, is_verified } = req.body;
  const sets = []; const vals = [];
  if (role)         { sets.push('role=?');        vals.push(role); }
  if (is_verified !== undefined) { sets.push('is_verified=?'); vals.push(is_verified ? 1 : 0); }
  if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' });
  vals.push(req.params.id);
  await db.query(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals);
  res.json({ success: true, message: 'User updated' });
};

// BANNERS
const getBanners = async (_req, res) => {
  const [banners] = await db.query('SELECT * FROM banners ORDER BY sort_order');
  res.json({ success: true, data: banners });
};
const createBanner = async (req, res) => {
  const { title, subtitle, link, position, sort_order } = req.body;
  const image = req.file ? `/uploads/banners/${req.file.filename}` : req.body.image;
  await db.query(
    'INSERT INTO banners (title,subtitle,image,link,position,sort_order) VALUES (?,?,?,?,?,?)',
    [title, subtitle, image, link, position || 'hero', sort_order || 0]
  );
  res.status(201).json({ success: true, message: 'Banner created' });
};
const updateBanner = async (req, res) => {
  const { title, subtitle, link, position, sort_order, is_active } = req.body;
  const sets = []; const vals = [];
  const fields = { title, subtitle, link, position, sort_order, is_active };
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) { sets.push(`${k}=?`); vals.push(v); } });
  if (req.file) { sets.push('image=?'); vals.push(`/uploads/banners/${req.file.filename}`); }
  vals.push(req.params.id);
  await db.query(`UPDATE banners SET ${sets.join(',')} WHERE id=?`, vals);
  res.json({ success: true, message: 'Banner updated' });
};
const deleteBanner = async (req, res) => {
  await db.query('DELETE FROM banners WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Banner deleted' });
};

// COUPONS
const getCoupons = async (_req, res) => {
  const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json({ success: true, data: coupons });
};
const createCoupon = async (req, res) => {
  const { code, description, discount_type, discount_value, min_order_value,
          max_discount, usage_limit, valid_from, valid_until } = req.body;
  await db.query(
    `INSERT INTO coupons (code,description,discount_type,discount_value,min_order_value,
     max_discount,usage_limit,valid_from,valid_until) VALUES (?,?,?,?,?,?,?,?,?)`,
    [code, description, discount_type, discount_value, min_order_value || 0,
     max_discount, usage_limit, valid_from, valid_until]
  );
  res.status(201).json({ success: true, message: 'Coupon created' });
};
const deleteCoupon = async (req, res) => {
  await db.query('DELETE FROM coupons WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Coupon deleted' });
};

// REVIEWS MODERATION
const getReviews = async (_req, res) => {
  const [reviews] = await db.query(
    `SELECT r.*, p.name AS product_name, u.name AS user_name
     FROM reviews r
     LEFT JOIN products p ON r.product_id=p.id
     LEFT JOIN users u ON r.user_id=u.id
     ORDER BY r.created_at DESC`
  );
  res.json({ success: true, data: reviews });
};
const approveReview = async (req, res) => {
  await db.query('UPDATE reviews SET is_approved=1 WHERE id=?', [req.params.id]);

  const [[rev]] = await db.query('SELECT product_id FROM reviews WHERE id=?', [req.params.id]);
  if (rev) {
    await db.query(
      `UPDATE products SET
       rating_avg=(SELECT AVG(rating) FROM reviews WHERE product_id=? AND is_approved=1),
       rating_count=(SELECT COUNT(*) FROM reviews WHERE product_id=? AND is_approved=1)
       WHERE id=?`,
      [rev.product_id, rev.product_id, rev.product_id]
    );
  }
  res.json({ success: true, message: 'Review approved' });
};
const deleteReview = async (req, res) => {
  await db.query('DELETE FROM reviews WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Review deleted' });
};

// CATEGORIES
const getCategories = async (_req, res) => {
  const [cats] = await db.query('SELECT * FROM categories ORDER BY sort_order');
  res.json({ success: true, data: cats });
};
const createCategory = async (req, res) => {
  const { name, slug, description, sort_order, parent_id } = req.body;
  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;
  await db.query(
    'INSERT INTO categories (name,slug,description,image,sort_order,parent_id) VALUES (?,?,?,?,?,?)',
    [name, slug, description, image, sort_order || 0, parent_id || null]
  );
  res.status(201).json({ success: true, message: 'Category created' });
};
const updateCategory = async (req, res) => {
  const { name, slug, description, sort_order, is_active } = req.body;
  const sets = []; const vals = [];
  const fields = { name, slug, description, sort_order, is_active };
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) { sets.push(`${k}=?`); vals.push(v); } });
  vals.push(req.params.id);
  await db.query(`UPDATE categories SET ${sets.join(',')} WHERE id=?`, vals);
  res.json({ success: true, message: 'Category updated' });
};

// NEWSLETTER
const getSubscribers = async (_req, res) => {
  const [subs] = await db.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
  res.json({ success: true, data: subs, total: subs.length });
};

// OFFERS
const getOffers = async (_req, res) => {
  const [offers] = await db.query('SELECT o.*, p.name AS product_name, c.name AS category_name FROM offers o LEFT JOIN products p ON o.product_id=p.id LEFT JOIN categories c ON o.category_id=c.id ORDER BY o.created_at DESC');
  res.json({ success: true, data: offers });
};
const createOffer = async (req, res) => {
  const { title, description, discount, product_id, category_id, starts_at, ends_at } = req.body;
  const image = req.file ? `/uploads/offers/${req.file.filename}` : null;
  await db.query(
    'INSERT INTO offers (title,description,image,discount,product_id,category_id,starts_at,ends_at) VALUES (?,?,?,?,?,?,?,?)',
    [title, description, image, discount, product_id || null, category_id || null, starts_at, ends_at]
  );
  res.status(201).json({ success: true, message: 'Offer created' });
};

// CONTACT MESSAGES
const getMessages = async (_req, res) => {
  const [msgs] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json({ success: true, data: msgs });
};
const markMessageRead = async (req, res) => {
  await db.query('UPDATE contact_messages SET is_read=1 WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Marked as read' });
};

module.exports = {
  getDashboard, getUsers, updateUser,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, createCoupon, deleteCoupon,
  getReviews, approveReview, deleteReview,
  getCategories, createCategory, updateCategory,
  getSubscribers, getOffers, createOffer,
  getMessages, markMessageRead,
};
