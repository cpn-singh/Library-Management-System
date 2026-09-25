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
        library: {
          50: '#f6f7f9',
          100: '#edeef2',
          200: '#d7dbe3',
          300: '#b4bccb',
          400: '#8c98ae',
          500: '#6d7b95',
          600: '#56627c',
          700: '#464f65',
          800: '#3c4355',
          900: '#1b2234',
          950: '#0f1422',
        },
        gold: {
          50: '#fdfbf7',
          100: '#faf5eb',
          200: '#f4e7ce',
          300: '#ecd2a6',
          400: '#e1b777',
          500: '#d49b4c',
          600: '#bf7f39',
          700: '#9f622e',
          800: '#814f2a',
          900: '#6a4125',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


