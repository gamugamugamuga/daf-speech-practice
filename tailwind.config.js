/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Yu Gothic UI', 'Meiryo', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#17201c',
        moss: '#51685a',
        mint: '#b9e8d5',
        coral: '#ff8f70',
        paper: '#f7f5ef',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 32, 28, 0.12)',
      },
    },
  },
  plugins: [],
};
