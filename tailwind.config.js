/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nia: {
          crimson: '#E11D48',
          ruby: '#BE123C',
          violet: '#C084FC',
          skin: '#B57B5B',
          dark: '#0B0B10',
          card: '#151520'
        }
      },
      keyframes: {
        cheer: {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-8px) rotate(3deg)' }
        },
        slotSpin: {
          '0%': { transform: 'translateY(-20%)', opacity: '0.4' },
          '50%': { transform: 'translateY(10%)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        cheer: 'cheer 0.65s ease-in-out infinite',
        slotSpin: 'slotSpin 0.25s ease-out'
      }
    },
  },
  plugins: [],
};
