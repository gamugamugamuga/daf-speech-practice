/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Yu Gothic UI', 'Meiryo', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#edf5f0',
        moss: '#9aa9a3',
        mint: '#8febca',
        coral: '#ff8f70',
        paper: '#111a1f',
      },
      boxShadow: {
        soft: '0 18px 54px rgba(0, 0, 0, 0.34)',
      },
    },
  },
  plugins: [],
};
