/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      }
    },
  },
  safelist: [
    'bg-emerald-400',
    'bg-amber-400',
    'bg-orange-400',
    'bg-rose-500',
    'bg-purple-500',
    'bg-red-600',
    'bg-red-700',
    'bg-red-800',
    'text-emerald-400',
    'text-amber-400',
    'text-orange-400',
    'text-rose-400',
    'text-purple-400',
    'text-red-400',
  ],
  plugins: [],
}
