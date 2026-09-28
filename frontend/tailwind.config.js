/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxe: {
          obsidian: '#05070a',
          midnight: '#090d14',
          card: '#0e1420',
          border: 'rgba(212, 175, 55, 0.15)',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          luxe: '#d4af37',
          champagne: '#f7e7ce',
          bronze: '#aa7c11',
        },
        platinum: {
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
        }
      },
      boxShadow: {
        'glow-gold': '0 0 35px -5px rgba(212, 175, 55, 0.28)',
        'glow-gold-lg': '0 0 55px -10px rgba(212, 175, 55, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(212, 175, 55, 0.2)',
        'luxe-card': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.12)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #fef08a 0%, #d4af37 50%, #aa7c11 100%)',
        'gradient-gold-subtle': 'linear-gradient(135deg, rgba(254, 240, 138, 0.15) 0%, rgba(212, 175, 55, 0.08) 50%, rgba(170, 124, 17, 0.15) 100%)',
        'gradient-dark-luxe': 'linear-gradient(145deg, #0e1420 0%, #07090e 100%)',
        'gold-foil': 'linear-gradient(110deg, #d4af37 0%, #fef08a 25%, #aa7c11 50%, #fef08a 75%, #d4af37 100%)',
      }
    },
  },
  plugins: [],
}
