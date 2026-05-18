import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';

const CATEGORY_ICONS = {
  'personalized-photo-frames': '🖼️',
  'led-frames':                '💡',
  'acrylic-frames':            '🔮',
  'wooden-frames':             '🪵',
  'glass-frames':              '🔲',
  'canvas-wall-art':           '🎨',
  'couple-gifts':              '💑',
  'birthday-gifts':            '🎂',
  'anniversary-gifts':         '💍',
  'festival-gifts':            '🎉',
  'corporate-gifts':           '💼',
  'kids-gifts':                '🧸',
  'customized-name-frames':    '✏️',
  'resin-art-gifts':           '💎',
  'photo-collage-frames':      '📷',
  'home-decor':                '🏠',
};

export default function CategorySlider({ categories = [] }) {
  return (
    <Swiper
      modules={[FreeMode]}
      freeMode
      spaceBetween={16}
      slidesPerView="auto"
      className="!px-4 md:!px-8"
    >
      {categories.map(cat => (
        <SwiperSlide key={cat.id} className="!w-auto">
          <Link
            to={`/products?category=${cat.slug}`}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl glass-card flex items-center justify-center text-3xl md:text-4xl
                            group-hover:border-gold-500/50 group-hover:shadow-gold transition-all duration-300">
              {CATEGORY_ICONS[cat.slug] || '🎁'}
            </div>
            <span className="text-xs md:text-sm text-white/70 group-hover:text-gold-400 transition-colors text-center font-medium max-w-[80px] leading-tight">
              {cat.name}
            </span>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
