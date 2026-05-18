const router = require('express').Router();
const { sendOtp, verifyOtp, register, login, me, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar }  = require('../middleware/upload');

router.post('/send-otp',    sendOtp);
router.post('/verify-otp',  verifyOtp);
router.post('/register',    register);
router.post('/login',       login);
router.get('/me',           authenticate, me);
router.put('/profile',      authenticate, uploadAvatar.single('avatar'), updateProfile);

module.exports = router;
