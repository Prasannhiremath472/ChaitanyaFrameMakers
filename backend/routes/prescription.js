const router = require('express').Router();
const { uploadCustomPhoto, getCustomUploads, submitContact, subscribe } = require('../controllers/prescriptionController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');
const { uploadCustom } = require('../middleware/upload');

router.post('/upload',    optionalAuth, uploadCustom.single('photo'), uploadCustomPhoto);
router.get('/uploads',    authenticate, isAdmin, getCustomUploads);
router.post('/contact',   submitContact);
router.post('/subscribe', subscribe);

module.exports = router;
