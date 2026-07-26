/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f2f2f7', // Backgrounds
          50: '#f8f8fc', 
          100: '#8686AC', // Light slate
          400: '#8686AC', // Provided light color
          600: '#505081', // Provided mid-tone
          700: '#3a3a69',
          800: '#272757', // Provided dark navy
          900: '#0F0E47', // Provided darkest navy
          950: '#08072b',
        }
      }
    },
  },
  plugins: [],
}
