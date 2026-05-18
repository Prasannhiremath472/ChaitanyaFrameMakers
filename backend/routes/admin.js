const router = require('express').Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');
const {
  getDashboard, getUsers, updateUser,
  getBanners, createBanner, updateBanner, deleteBanner,
  getCoupons, createCoupon, deleteCoupon,
  getReviews, approveReview, deleteReview,
  getSubscribers, getOffers, createOffer,
  getMessages, markMessageRead,
} = require('../controllers/adminController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.use(authenticate, isAdmin);

router.get('/dashboard',        getDashboard);
router.get('/users',            getUsers);
router.put('/users/:id',        updateUser);

router.get('/orders',           getAllOrders);
router.put('/orders/:id',       updateOrderStatus);

router.get('/banners',          getBanners);
router.post('/banners',         uploadBanner.single('image'), createBanner);
router.put('/banners/:id',      uploadBanner.single('image'), updateBanner);
router.delete('/banners/:id',   deleteBanner);

router.get('/coupons',          getCoupons);
router.post('/coupons',         createCoupon);
router.delete('/coupons/:id',   deleteCoupon);

router.get('/reviews',          getReviews);
router.put('/reviews/:id/approve', approveReview);
router.delete('/reviews/:id',   deleteReview);

router.get('/subscribers',      getSubscribers);

router.get('/offers',           getOffers);
router.post('/offers',          uploadBanner.single('image'), createOffer);

router.get('/messages',         getMessages);
router.put('/messages/:id/read',markMessageRead);

module.exports = router;
