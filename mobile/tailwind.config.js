/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#13131A',
        elevated: '#1C1C26',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: '#2D2D3D',
        muted: '#6B7280',
      },
    },
  },
  plugins: [],
};
