const db     = require('../models/db');
const { sendOrderConfirmation } = require('../utils/mailer');

const generateOrderNumber = () =>
  `CFM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// POST /api/orders
const createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { items, address, coupon_code, payment_method, notes } = req.body;
    if (!items?.length) throw new Error('Cart is empty');

    const productIds = items.map(i => i.product_id);
    const [products] = await conn.query(
      `SELECT id, name, sku, price, sale_price, stock,
              (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
       FROM products p WHERE id IN (?)`, [productIds]
    );

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const p = productMap[item.product_id];
      if (!p) throw new Error(`Product ${item.product_id} not found`);
      if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}`);
      const unit = parseFloat(p.sale_price || p.price);
      subtotal  += unit * item.quantity;
      orderItems.push({
        product_id: p.id, product_name: p.name, product_sku: p.sku,
        product_image: p.image, quantity: item.quantity,
        unit_price: unit, total_price: unit * item.quantity,
        customization: item.customization || null,
      });
    }

    let discount = 0;
    let couponId = null;
    if (coupon_code) {
      const [[coupon]] = await conn.query(
        `SELECT * FROM coupons WHERE code=? AND is_active=1
         AND (valid_from IS NULL OR valid_from <= CURDATE())
         AND (valid_until IS NULL OR valid_until >= CURDATE())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [coupon_code]
      );
      if (coupon && subtotal >= coupon.min_order_value) {
        couponId = coupon.id;
        discount = coupon.discount_type === 'percent'
          ? Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || Infinity)
          : Math.min(coupon.discount_value, coupon.max_discount || coupon.discount_value);
        await conn.query('UPDATE coupons SET used_count = used_count + 1 WHERE id=?', [coupon.id]);
      }
    }

    const shipping = subtotal - discount >= 999 ? 0 : 79;
    const tax      = parseFloat(((subtotal - discount) * 0.00).toFixed(2));
    const total    = parseFloat((subtotal - discount + shipping + tax).toFixed(2));

    const [r] = await conn.query(
      `INSERT INTO orders
       (order_number, user_id, payment_method, subtotal, discount, shipping_charge, tax, total,
        coupon_id, address_snapshot, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [generateOrderNumber(), req.user?.id || null, payment_method || 'razorpay',
       subtotal, discount, shipping, tax, total,
       couponId, JSON.stringify(address), notes || null]
    );
    const orderId     = r.insertId;
    const [[newOrder]] = await conn.query('SELECT order_number FROM orders WHERE id=?', [orderId]);

    const itemValues = orderItems.map(i => [
      orderId, i.product_id, i.product_name, i.product_sku, i.product_image,
      i.quantity, i.unit_price, i.total_price,
      i.customization ? JSON.stringify(i.customization) : null,
    ]);
    await conn.query(
      `INSERT INTO order_items
       (order_id,product_id,product_name,product_sku,product_image,quantity,unit_price,total_price,customization)
       VALUES ?`, [itemValues]
    );

    for (const item of orderItems) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE id=?', [item.quantity, item.product_id]);
    }

    if (req.user?.id) {
      await conn.query('DELETE FROM cart_items WHERE user_id=?', [req.user.id]);
    }

    await conn.commit();

    if (req.user?.email) {
      sendOrderConfirmation(req.user.email, { order_number: newOrder.order_number, total }).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: 'Order created',
      order: { id: orderId, order_number: newOrder.order_number, total },
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ success: false, message: err.message || 'Order creation failed' });
  } finally {
    conn.release();
  }
};

// GET /api/orders
const getUserOrders = async (req, res) => {
  const [orders] = await db.query(
    `SELECT o.*, GROUP_CONCAT(oi.product_name SEPARATOR ', ') AS product_names
     FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id=? GROUP BY o.id ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: orders });
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  const [[order]] = await db.query('SELECT * FROM orders WHERE id=? AND user_id=?',
    [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const [items] = await db.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
  res.json({ success: true, data: { ...order, items } });
};

// GET /api/admin/orders (admin)
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where  = []; const params = [];
  if (status) { where.push('o.status=?'); params.push(status); }
  if (search) { where.push('(o.order_number LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM orders o LEFT JOIN users u ON o.user_id=u.id ${w}`, params);
  const [orders] = await db.query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o LEFT JOIN users u ON o.user_id=u.id
     ${w} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );
  res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
};

// PUT /api/admin/orders/:id (admin)
const updateOrderStatus = async (req, res) => {
  const { status, tracking_number } = req.body;
  const sets = []; const vals = [];
  if (status)          { sets.push('status=?');          vals.push(status); }
  if (tracking_number) { sets.push('tracking_number=?'); vals.push(tracking_number); }
  if (status === 'shipped')   { sets.push('shipped_at=NOW()'); }
  if (status === 'delivered') { sets.push('delivered_at=NOW()'); }
  vals.push(req.params.id);
  await db.query(`UPDATE orders SET ${sets.join(',')} WHERE id=?`, vals);
  res.json({ success: true, message: 'Order updated' });
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus };
