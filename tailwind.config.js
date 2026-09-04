/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          pink: '#E1306C',
          purple: '#833AB4',
          orange: '#F56040',
          yellow: '#FCAF45',
          dark: '#121212',
          surface: '#1E1E1E',
          card: '#262626',
          border: '#363636',
          accent: '#0095F6',
          hover: '#1877F2',
        },
      },
    },
  },
  plugins: [],
};
