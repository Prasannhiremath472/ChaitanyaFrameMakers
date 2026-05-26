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
  const [hovered, setHovered]  = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const discount = getDiscount(product.price, product.sale_price);
  const img      = getImageUrl(product.image);

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addItem(product);
    toast.success('Added to cart! 🛒');
  };

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await addToWishlist(product.id);
      setWishlisted(true);
      toast.success('Added to wishlist ❤️');
    } catch { toast.error('Please login to use wishlist'); }
  };

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer ${className}`}
      style={{
        background: '#fff',
        border: '1px solid #f0f0f0',
        boxShadow: hovered
          ? '0 20px 60px rgba(204,0,0,0.13), 0 4px 20px rgba(0,0,0,0.06)'
          : '0 2px 16px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
      <Link to={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f8f8f8' }}>
          {!imgLoaded && (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          )}
          <img
            src={img}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              opacity: imgLoaded ? 1 : 0,
              transition: 'transform 0.6s ease, opacity 0.3s ease',
            }}
          />

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(26,0,0,0.45) 0%, transparent 55%)',
              opacity: hovered ? 1 : 0,
            }} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="px-2.5 py-1 text-white text-xs font-bold rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(204,0,0,0.9)' }}>
                -{discount}%
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="px-2.5 py-1 text-white text-xs font-bold rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(139,0,0,0.88)' }}>
                ⭐ Bestseller
              </span>
            )}
            {product.is_trending === 1 && !product.is_bestseller && (
              <span className="px-2.5 py-1 text-white text-xs font-bold rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(124,58,237,0.88)' }}>
                🔥 Trending
              </span>
            )}
            {product.is_customizable === 1 && (
              <span className="px-2.5 py-1 text-white text-xs font-bold rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(14,165,233,0.88)' }}>
                ✏️ Custom
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
            style={{
              background: wishlisted ? '#CC0000' : 'rgba(255,255,255,0.95)',
              color: wishlisted ? '#fff' : '#888',
              opacity: hovered || wishlisted ? 1 : 0,
              transform: hovered || wishlisted ? 'scale(1) translateY(0)' : 'scale(0.75) translateY(-4px)',
            }}
            aria-label="Add to wishlist">
            <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick add — slides up on hover */}
          <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300"
            style={{
              transform: hovered ? 'translateY(0)' : 'translateY(110%)',
              opacity: hovered ? 1 : 0,
            }}>
            <button onClick={handleAddToCart}
              className="w-full py-2.5 rounded-2xl text-sm font-bold text-white backdrop-blur-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #CC0000, #8B0000)', boxShadow: '0 4px 20px rgba(139,0,0,0.5)' }}>
              🛒 Quick Add
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 pb-5">
          <p className="text-xs font-medium mb-1 truncate" style={{ color: '#CC0000', opacity: 0.8 }}>
            {product.category_name}
          </p>
          <h3 className="font-semibold text-sm leading-snug mb-2.5 line-clamp-2 transition-colors duration-200"
            style={{ color: hovered ? '#CC0000' : '#1a0000' }}>
            {product.name}
          </h3>

          {/* Stars */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className="w-3 h-3" style={{ color: s <= Math.round(product.rating_avg) ? '#CC0000' : '#e5e5e5' }}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: '#aaa' }}>
                {product.rating_avg} <span style={{ color: '#ddd' }}>({product.rating_count})</span>
              </span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base" style={{ color: '#CC0000' }}>
              {formatPrice(product.sale_price || product.price)}
            </span>
            {product.sale_price && (
              <span className="text-sm line-through" style={{ color: '#ccc' }}>
                {formatPrice(product.price)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                Save {discount}%
              </span>
            )}
          </div>

          {product.stock === 0 && (
            <p className="text-xs mt-2 font-semibold" style={{ color: '#ef4444' }}>⚠ Out of Stock</p>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs mt-2 font-semibold" style={{ color: '#f97316' }}>Only {product.stock} left!</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
