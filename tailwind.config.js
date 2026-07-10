import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: '0 40px 120px rgba(15, 23, 42, 0.18)',
      },
      colors: {
        night: '#0b1220',
        twilight: '#331e4f',
        dawn: '#e7b07e',
        summit: '#f8e6c8',
      },
    },
  },
  plugins: [],
};
