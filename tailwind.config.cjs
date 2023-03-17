/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'mobile-xs': { max: '369px' },
        'mobile': { max: '767px' },
      },
    }
  },
  plugins: []
};
