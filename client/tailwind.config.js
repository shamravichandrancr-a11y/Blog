/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          black: '#050505',
          darker: '#090909',
          dark: '#111111',
          card: '#161616',
          card2: '#1B1B1B',
          chrome: '#D4D4D8',
          silver: '#A1A1AA',
          border: 'rgba(255,255,255,0.08)',
          highlight: 'rgba(255,255,255,0.15)',
        }
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'neo': '8px 8px 16px #000000, -4px -4px 12px rgba(255,255,255,0.04)',
        'neo-sm': '4px 4px 8px #000000, -2px -2px 6px rgba(255,255,255,0.04)',
        'neo-inset': 'inset 4px 4px 8px #000000, inset -2px -2px 6px rgba(255,255,255,0.06)',
        'chrome': '0 0 20px rgba(212,212,216,0.1)',
        'chrome-lg': '0 0 40px rgba(212,212,216,0.15)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.8 },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
