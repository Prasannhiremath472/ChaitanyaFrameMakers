import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { formatPrice, getDiscount, getImageUrl } from '../utils/helpers';
import useCartStore from '../store/cartStore';
import { addToWishlist } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, className = '' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const discount = getDiscount(product.price, product.sale_price);
  const img      = getImageUrl(product.image);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToWishlist(product.id);
      setWishlisted(true);
      toast.success('Added to wishlist ❤️');
    } catch { toast.error('Please login to use wishlist'); }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative card-dark overflow-hidden ${className}`}
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-dark-800">
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={img}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110
                        ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">
                -{discount}%
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="px-2 py-0.5 bg-gold-gradient text-black text-xs font-bold rounded-lg">
                Bestseller
              </span>
            )}
            {product.is_trending === 1 && (
              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-lg">
                Trending
              </span>
            )}
            {product.is_customizable === 1 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                Customizable
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                        backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100
                        ${wishlisted ? 'bg-red-500 text-white' : 'bg-black/50 text-white/70 hover:text-red-400'}`}
            aria-label="Add to wishlist"
          >
            <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="btn-gold w-full py-2.5 text-sm justify-center rounded-xl"
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-dark-400 text-xs mb-1">{product.category_name}</p>
          <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating_avg) ? 'text-gold-400' : 'text-dark-700'}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-dark-400 text-xs">({product.rating_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-gold-400 font-bold text-lg">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-dark-500 text-sm line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.stock === 0 && (
            <p className="text-red-400 text-xs mt-1 font-medium">Out of Stock</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
