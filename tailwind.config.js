/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#3a0d12',
        velvet: '#5b0f15',
        navy: '#1a1a2e',
        crimson: '#8b1538',
        gold: '#d4af37',
        parchment: '#f4e4bc',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-warm': '0 0 30px rgba(139, 21, 56, 0.2)',
        'parchment': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'flicker': 'flicker 1.2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

