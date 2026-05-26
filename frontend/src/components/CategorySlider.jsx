import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';

const CATEGORY_META = {
  'personalized-photo-frames': { icon: '🖼️', color: '#CC0000', bg: 'rgba(204,0,0,0.07)' },
  'led-frames':                { icon: '💡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'acrylic-frames':            { icon: '🔮', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  'wooden-frames':             { icon: '🪵', color: '#92400e', bg: 'rgba(146,64,14,0.1)'  },
  'glass-frames':              { icon: '🔲', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  'canvas-wall-art':           { icon: '🎨', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'couple-gifts':              { icon: '💑', color: '#ec4899', bg: 'rgba(236,72,153,0.1)'  },
  'birthday-gifts':            { icon: '🎂', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  'anniversary-gifts':         { icon: '💍', color: '#CC0000', bg: 'rgba(204,0,0,0.07)'   },
  'festival-gifts':            { icon: '🎉', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  'corporate-gifts':           { icon: '💼', color: '#1e40af', bg: 'rgba(30,64,175,0.1)'  },
  'kids-gifts':                { icon: '🧸', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  'customized-name-frames':    { icon: '✏️', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  'resin-art-gifts':           { icon: '💎', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  'photo-collage-frames':      { icon: '📷', color: '#CC0000', bg: 'rgba(204,0,0,0.07)'   },
  'home-decor':                { icon: '🏠', color: '#065f46', bg: 'rgba(6,95,70,0.1)'    },
};

export default function CategorySlider({ categories = [] }) {
  return (
    <Swiper
      modules={[FreeMode]}
      freeMode
      spaceBetween={14}
      slidesPerView="auto"
      className="!px-4 md:!px-8 !pb-4"
    >
      {categories.map(cat => {
        const meta = CATEGORY_META[cat.slug] || { icon: '🎁', color: '#CC0000', bg: 'rgba(204,0,0,0.07)' };
        return (
          <SwiperSlide key={cat.id} className="!w-auto">
            <Link to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 group w-24 md:w-28">
              {/* Icon circle */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center
                              text-3xl md:text-4xl transition-all duration-300"
                style={{ background: meta.bg, border: `1.5px solid transparent` }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = meta.color + '40';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${meta.color}22`;
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}>
                {meta.icon}
              </div>
              {/* Label */}
              <span className="text-xs text-center font-semibold leading-tight transition-colors"
                style={{ color: '#555', maxWidth: '80px' }}
                onMouseEnter={e => e.currentTarget.style.color = meta.color}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                {cat.name}
              </span>
              {cat.count > 0 && (
                <span className="text-xs -mt-2" style={{ color: '#bbb' }}>{cat.count} items</span>
              )}
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
