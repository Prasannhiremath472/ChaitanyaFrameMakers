// Re-export via /api/otp for backward compat
const router = require('express').Router();
const { sendOtp, verifyOtp } = require('../controllers/authController');
router.post('/send',   sendOtp);
router.post('/verify', verifyOtp);
module.exports = router;
