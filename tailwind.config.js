/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: { colors: {
      'dark-olive-green': '#3c4731',
      'dark-olive-green-dark': '#17240c', // Slightly darker shade for hover effect
      },
    },
  },
  plugins: [],
}
