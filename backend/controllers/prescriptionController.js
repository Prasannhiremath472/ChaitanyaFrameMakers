const db = require('../models/db');

// POST /api/custom/upload - Upload custom photo for frame personalization
const uploadCustomPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { product_id, order_id } = req.body;
    const filePath = `/uploads/custom/${req.file.filename}`;

    const [r] = await db.query(
      `INSERT INTO custom_uploads (user_id, file_name, file_path, file_size, mime_type, product_id, order_id)
       VALUES (?,?,?,?,?,?,?)`,
      [req.user?.id || null, req.file.originalname, filePath,
       req.file.size, req.file.mimetype, product_id || null, order_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      upload: { id: r.insertId, file_path: filePath },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

// GET /api/custom/uploads (admin)
const getCustomUploads = async (_req, res) => {
  const [uploads] = await db.query(
    `SELECT cu.*, u.name AS user_name, u.email AS user_email
     FROM custom_uploads cu LEFT JOIN users u ON cu.user_id=u.id
     ORDER BY cu.created_at DESC LIMIT 100`
  );
  res.json({ success: true, data: uploads });
};

// POST /api/contact
const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'Name, email and message required' });
  await db.query(
    'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)',
    [name, email, phone, subject, message]
  );
  res.status(201).json({ success: true, message: 'Message sent! We\'ll get back to you soon.' });
};

// POST /api/newsletter/subscribe
const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  try {
    await db.query(
      'INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE is_active=1',
      [email]
    );
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Subscription failed' });
  }
};

module.exports = { uploadCustomPhoto, getCustomUploads, submitContact, subscribe };
