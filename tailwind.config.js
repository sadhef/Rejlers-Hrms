/** @type {import('tailwindcss').Config} */
export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // ThemeProvider toggles a `dark` class on <html>; the default media strategy would ignore it.
  darkMode: 'class',
  plugins: [],
};
