/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#C9A84C',
          600: '#b8962a',
          700: '#8B6914',
          800: '#713f12',
          900: '#422006',
        },
        dark: {
          50:  '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #8B6914 50%, #C9A84C 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        'glass':         'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'gold':    '0 0 30px rgba(201,168,76,0.3)',
        'gold-lg': '0 0 60px rgba(201,168,76,0.4)',
        'glass':   '0 8px 32px rgba(0,0,0,0.37)',
      },
      animation: {
        'shimmer':    'shimmer 2s infinite linear',
        'float':      'float 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(201,168,76,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
