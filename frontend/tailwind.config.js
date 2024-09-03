/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.js", // This will include all .js files in src directory and its subdirectories
  ],
  theme: {
    screens: {
      'xs': '360px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        primary: '#124559',       // Main color for primary actions
        primaryHover: '#124565',  // Hover
        secondary: '#598392',     // Secondary actions
        accent: '#aec3b0',        // Highlighting elements
        neutral: '#eff6e0',       // Backgrounds, cards, sections
        dark: '#01161eff',        // Text, headings, dark backgrounds
      },
    },
  },
  plugins: [],
}