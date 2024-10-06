/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,jsx,tsx}',   // Ensure main app files are scanned
    './screens/**/*.{js,ts,jsx,tsx}', // Add screen components
    './components/**/*.{js,ts,jsx,tsx}', // Add other component paths
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
};
