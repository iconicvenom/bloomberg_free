/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#000000',
          panel: '#0A0A0A',
          border: '#1C1C1C',
          header: '#141414',
          divider: '#222222',
        },
        bb: {
          orange: '#FF6600',
          green: '#00FF41',
          red: '#FF3131',
          amber: '#FFAA00',
          blue: '#4FC3F7',
          white: '#FFFFFF',
          gray: '#B0B0B0',
          dark: '#555555',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': '10px',
      },
      boxShadow: {
        'bb-glow': '0 0 8px rgba(255,102,0,0.4)',
        'bb-glow-lg': '0 0 16px rgba(255,102,0,0.5)',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(0,255,65,0.45)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(255,49,49,0.45)' },
          '100%': { backgroundColor: 'transparent' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scrollUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'flash-green': 'flashGreen 0.6s ease-out',
        'flash-red': 'flashRed 0.6s ease-out',
        'blink': 'blink 1s step-end infinite',
        'scroll-up': 'scrollUp 30s linear infinite',
        'marquee': 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
