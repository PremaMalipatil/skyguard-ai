/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#020b18',
          navy: '#040f1f',
          panel: '#061224',
          border: '#0d2d4a',
          cyan: '#00f5ff',
          cyan2: '#00c8d4',
          blue: '#0080ff',
          red: '#ff1a3c',
          orange: '#ff6b00',
          green: '#00ff88',
          yellow: '#ffdd00',
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        display: ['"Orbitron"', 'monospace'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulse-red 1.5s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 5px #ff1a3c, 0 0 20px #ff1a3c40' },
          '50%': { boxShadow: '0 0 15px #ff1a3c, 0 0 40px #ff1a3c80' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'border-flow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '92%': { opacity: 1 },
          '93%': { opacity: 0.4 },
          '94%': { opacity: 1 },
          '96%': { opacity: 0.6 },
          '97%': { opacity: 1 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
