/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: '18px',
        lg: '20px',
        xl: '22px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      colors: {
        // Deep Blue Palette (replacing gray colors)
        primary: '#1e3a8a',
        primaryDark: '#1e293b',
        primaryLight: '#0ea5e9',
        secondary: '#475569',
        tertiary: '#64748b',
        surface: '#f1f5f9',
        surfaceAlt: '#e2e8f0',
        // Status colors
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        // Background colors
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
      },
    },
  },
  plugins: [],
};


