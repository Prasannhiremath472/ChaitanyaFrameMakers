const router = require('express').Router();
const { createOrder, getUserOrders, getOrderById } = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.post('/',   optionalAuth, createOrder);
router.get('/',    authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);

module.exports = router;
