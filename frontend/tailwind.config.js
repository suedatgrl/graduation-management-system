/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'course-blm': '#3b82f6',
        'course-com': '#10b981',
      }
    },
  },
  plugins: [],
}