/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand palette extracted from Chaitanya FrameMakers logo ──
        brand: {
          50:  '#fff1f1',
          100: '#ffdede',
          200: '#ffc0c0',
          300: '#ff9494',
          400: '#ff5757',
          500: '#CC0000',   // bright red
          600: '#A50000',   // primary brand red
          700: '#8B0000',   // deep crimson (main)
          800: '#6B0000',   // dark crimson
          900: '#450000',   // very dark
          950: '#1a0000',   // near black red
        },
        dark: {
          50:  '#f7f7f7',
          100: '#ebebeb',
          200: '#d4d4d4',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',   // logo subtitle gray
          600: '#4A4A4A',   // logo text gray
          700: '#333333',
          800: '#222222',
          900: '#141414',
          950: '#0a0000',   // red-tinted near black
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        hindi:   ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      backgroundImage: {
        // Red gradient matching logo
        'brand-gradient': 'linear-gradient(135deg, #CC0000 0%, #8B0000 50%, #CC0000 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #8B0000 0%, #450000 100%)',
        'dark-gradient':  'linear-gradient(135deg, #0a0000 0%, #1a0808 100%)',
        'glass':          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        'hero-pattern':   'radial-gradient(ellipse at top, #3a0000 0%, #0a0000 70%)',
      },
      boxShadow: {
        'brand':    '0 0 30px rgba(165,0,0,0.35)',
        'brand-lg': '0 0 60px rgba(165,0,0,0.5)',
        'brand-sm': '0 0 15px rgba(165,0,0,0.25)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'shimmer':     'shimmer 2s infinite linear',
        'float':       'float 3s ease-in-out infinite',
        'pulse-brand': 'pulse-brand 2s ease-in-out infinite',
        'glow':        'glow 3s ease-in-out infinite',
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
        'pulse-brand': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(165,0,0,0.3)' },
          '50%':      { boxShadow: '0 0 50px rgba(204,0,0,0.7)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.6 },
          '50%':      { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
