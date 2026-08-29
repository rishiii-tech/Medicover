/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medicover: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc4fb',
          400: '#36a5f7',
          500: '#0c87eb',
          600: '#006ac9',
          700: '#0154a3',
          800: '#064786',
          900: '#0a3c6f',
          950: '#07264a',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#090d16'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
