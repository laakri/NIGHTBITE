/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#0A0A0F',
        'card-bg': '#121218',
        'sun-primary': '#FF4D4D',
        'sun-secondary': '#FF1A1A',
        'moon-primary': '#4D4DFF',
        'moon-secondary': '#1A1AFF',
        'eclipse-primary': '#8A2BE2',
        'eclipse-secondary': '#6A1B9A',
        'blood-primary': '#8B0000',
        'blood-secondary': '#4B0000',
        'void-primary': '#00008B',
        'void-secondary': '#00004B',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in forwards',
        'fade-out': 'fadeOut 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 0, 0, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'blood-pattern': "url('/src/assets/patterns/blood.png')",
        'void-pattern': "url('/src/assets/patterns/void.png')",
      }
    },
  },
  plugins: [],
}