/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cyber-bg':      '#050508',
        'cyber-surface': '#0d0d14',
        'cyber-panel':   '#12121c',
        'cyber-border':  '#1a1f30',
        'cyber-cyan':    '#00d4ff',
        'cyber-teal':    '#00b4a0',
        'cyber-dim':     '#0a8fa8',
        'cyber-text':    '#c8d8e8',
        'cyber-muted':   '#4a5a6a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm':  '0 0 8px rgba(0, 212, 255, 0.25)',
        'glow-md':  '0 0 20px rgba(0, 212, 255, 0.35)',
        'glow-lg':  '0 0 40px rgba(0, 212, 255, 0.5)',
        'glow-teal':'0 0 20px rgba(0, 180, 160, 0.4)',
      },
      backgroundImage: {
        'grid-cyber': 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
        'gradient-cyber': 'linear-gradient(135deg, #050508 0%, #0d0d14 50%, #050508 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line':  'scan-line 4s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 8px rgba(0,212,255,0.25)' },
          '50%':       { opacity: '1',   boxShadow: '0 0 24px rgba(0,212,255,0.6)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
