const router = require('express').Router();
const {
  getProducts, getProductBySlug, createProduct, updateProduct,
  deleteProduct, addReview, searchProducts
} = require('../controllers/productController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

router.get('/search',       searchProducts);
router.get('/',             getProducts);
router.get('/:slug',        optionalAuth, getProductBySlug);
router.post('/:id/reviews', authenticate, addReview);

// Admin
router.post('/',   authenticate, isAdmin, uploadProduct.array('images', 8), createProduct);
router.put('/:id', authenticate, isAdmin, uploadProduct.array('images', 8), updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
