/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#080C10',
          secondary: '#0D1318',
          tertiary: '#141B22',
        },
        accent: {
          cyan: '#00F0FF',
          lime: '#B9FF4B',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8B9CB3',
          muted: '#4A5568',
        },
        border: 'rgba(0, 240, 255, 0.15)',
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'grid': 'grid 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        grid: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}