module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // Indigo
        accent: '#22C55E',  // Green
        warning: '#F59E0B', // Amber
        danger: '#EF4444',  // Red
        background: '#F8FAFC',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 24px 0 rgba(0,0,0,0.06)',
        'card': '0 2px 16px 0 rgba(99,102,241,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
