const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../models/db');
const { sendOTP } = require('../utils/mailer');

const generateOTP   = () => Math.floor(100000 + Math.random() * 900000).toString();
const signToken     = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  const { email, purpose = 'login' } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `INSERT INTO otp_verifications (email, otp, purpose, expires_at)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp=?, expires_at=?, used=0`,
      [email, otp, purpose, expiresAt, otp, expiresAt]
    );

    await sendOTP(email, otp, purpose);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  const { email, otp, name, phone } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

  try {
    const [[record]] = await db.query(
      `SELECT * FROM otp_verifications
       WHERE email=? AND otp=? AND used=0 AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email, otp]
    );
    if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    await db.query('UPDATE otp_verifications SET used=1 WHERE id=?', [record.id]);

    let [[user]] = await db.query('SELECT * FROM users WHERE email=?', [email]);

    if (!user) {
      const [result] = await db.query(
        'INSERT INTO users (name, email, phone, is_verified) VALUES (?, ?, ?, 1)',
        [name || email.split('@')[0], email, phone || null]
      );
      [[user]] = await db.query('SELECT * FROM users WHERE id=?', [result.insertId]);
    } else if (!user.is_verified) {
      await db.query('UPDATE users SET is_verified=1 WHERE id=?', [user.id]);
      user.is_verified = 1;
    }

    const token = signToken(user.id, user.role);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password required' });

  try {
    const [[exists]] = await db.query('SELECT id FROM users WHERE email=?', [email]);
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const [r]  = await db.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hash]
    );

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'INSERT INTO otp_verifications (email, otp, purpose, expires_at) VALUES (?, ?, "register", ?)',
      [email, otp, expiresAt]
    );
    await sendOTP(email, otp, 'register');

    res.status(201).json({ success: true, message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  try {
    const [[user]] = await db.query('SELECT * FROM users WHERE email=?', [email]);
    if (!user || !user.password_hash)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user.id, user.role);
    res.json({
      success: true, token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  const [[user]] = await db.query(
    'SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id=?', [req.user.id]
  );
  res.json({ success: true, user });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
  const sets   = [];
  const vals   = [];
  if (name)   { sets.push('name=?');   vals.push(name); }
  if (phone)  { sets.push('phone=?');  vals.push(phone); }
  if (avatar) { sets.push('avatar=?'); vals.push(avatar); }
  if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' });
  vals.push(req.user.id);
  await db.query(`UPDATE users SET ${sets.join(',')} WHERE id=?`, vals);
  res.json({ success: true, message: 'Profile updated' });
};

module.exports = { sendOtp, verifyOtp, register, login, me, updateProfile };
