const db = require('../models/db');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 16, category, search, sort = 'created_at',
      order = 'DESC', featured, bestseller, trending, minPrice, maxPrice, tag
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['p.is_active = 1'];
    const params = [];

    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (search)   { where.push('MATCH(p.name, p.description, p.tags) AGAINST(? IN BOOLEAN MODE)'); params.push(`*${search}*`); }
    if (featured)   { where.push('p.is_featured = 1'); }
    if (bestseller) { where.push('p.is_bestseller = 1'); }
    if (trending)   { where.push('p.is_trending = 1'); }
    if (minPrice)   { where.push('p.price >= ?'); params.push(parseFloat(minPrice)); }
    if (maxPrice)   { where.push('p.price <= ?'); params.push(parseFloat(maxPrice)); }
    if (tag)        { where.push('JSON_CONTAINS(p.tags, ?)'); params.push(JSON.stringify(tag)); }

    const allowedSorts  = ['price', 'rating_avg', 'created_at', 'views', 'name'];
    const allowedOrders = ['ASC', 'DESC'];
    const safeSort  = allowedSorts.includes(sort)  ? `p.${sort}` : 'p.created_at';
    const safeOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}`;
    const [[{ total }]] = await db.query(countSql, params);

    const sql = `
      SELECT p.id, p.name, p.slug, p.sku, p.short_desc, p.price, p.sale_price,
             p.stock, p.is_customizable, p.is_featured, p.is_bestseller,
             p.rating_avg, p.rating_count, p.tags, p.views,
             c.name AS category_name, c.slug AS category_slug,
             (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?`;

    const [products] = await db.query(sql, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const [[product]] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const [images]  = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [product.id]);
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC LIMIT 20`,
      [product.id]
    );

    // Related products
    const [related] = await db.query(
      `SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.rating_avg,
              (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
       FROM products p
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY p.is_featured DESC, p.rating_avg DESC LIMIT 8`,
      [product.category_id, product.id]
    );

    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [product.id]);

    res.json({ success: true, data: { ...product, images, reviews, related } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  try {
    const {
      name, slug, sku, description, short_desc, price, sale_price,
      stock, category_id, brand, material, dimensions, is_customizable,
      is_featured, is_bestseller, is_trending, meta_title, meta_desc,
      meta_keywords, color_options, size_options, tags
    } = req.body;

    const [r] = await db.query(
      `INSERT INTO products
       (name,slug,sku,description,short_desc,price,sale_price,stock,category_id,
        brand,material,dimensions,is_customizable,is_featured,is_bestseller,is_trending,
        meta_title,meta_desc,meta_keywords,color_options,size_options,tags)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, sku, description, short_desc, price, sale_price || null,
       stock || 0, category_id || null, brand, material, dimensions,
       is_customizable ? 1 : 0, is_featured ? 1 : 0, is_bestseller ? 1 : 0, is_trending ? 1 : 0,
       meta_title, meta_desc, meta_keywords,
       color_options ? JSON.stringify(color_options) : null,
       size_options  ? JSON.stringify(size_options)  : null,
       tags          ? JSON.stringify(tags)          : null]
    );

    if (req.files?.length) {
      const imgValues = req.files.map((f, i) =>
        [r.insertId, `/uploads/products/${f.filename}`, i === 0 ? 1 : 0, i]);
      await db.query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ?',
        [imgValues]
      );
    }

    res.status(201).json({ success: true, message: 'Product created', id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create product' });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  try {
    const fields = ['name','slug','sku','description','short_desc','price','sale_price',
      'stock','category_id','brand','material','dimensions','is_customizable','is_featured',
      'is_bestseller','is_trending','is_active','meta_title','meta_desc','meta_keywords','tags'];
    const sets = []; const vals = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) { sets.push(`${f}=?`); vals.push(req.body[f]); }
    });
    if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE products SET ${sets.join(',')} WHERE id=?`, vals);

    if (req.files?.length) {
      const imgValues = req.files.map((f, i) =>
        [req.params.id, `/uploads/products/${f.filename}`, 0, i + 100]);
      await db.query(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ?',
        [imgValues]
      );
    }
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  await db.query('UPDATE products SET is_active=0 WHERE id=?', [req.params.id]);
  res.json({ success: true, message: 'Product deactivated' });
};

// POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    if (!rating) return res.status(400).json({ success: false, message: 'Rating required' });
    await db.query(
      'INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?,?,?,?,?)',
      [req.params.id, req.user.id, rating, title, body]
    );
    res.status(201).json({ success: true, message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};

// GET /api/products/search?q=
const searchProducts = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: [] });
  const [products] = await db.query(
    `SELECT p.id, p.name, p.slug, p.price, p.sale_price,
            (SELECT image_url FROM product_images WHERE product_id=p.id AND is_primary=1 LIMIT 1) AS image
     FROM products p WHERE p.is_active=1 AND
     (p.name LIKE ? OR p.short_desc LIKE ?) LIMIT 10`,
    [`%${q}%`, `%${q}%`]
  );
  res.json({ success: true, data: products });
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, addReview, searchProducts };
