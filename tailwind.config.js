/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0E1117',
        surface: '#1A202C',
        card:    '#1F2937',
        border:  '#2D3748',
        muted:   '#9A9EA3',
        text:    '#E2E8F0',
        yellow:  { DEFAULT: '#F6E05E', dark: '#CFBC4F', dim: '#A79840' },
        green:   { DEFAULT: '#4A7C59', light: '#84A68E', pale: '#CCDAD1' },
        red:     { DEFAULT: '#E05E5E', light: '#EA9292', pale: '#F6D2D2' },
        purple:  { DEFAULT: '#7C3AED', light: '#A78BFA' },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel:      '4px 4px 0px #0E1117',
        'pixel-sm': '2px 2px 0px #0E1117',
        'pixel-y':  '0px 4px 0px #0E1117',
        'pixel-in': 'inset 2px 2px 0px rgba(0,0,0,0.4)',
      },
      animation: {
        'blink':    'blink 1s step-end infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in':  'fadeIn 0.4s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
