/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Brutalist color palette
        brutal: {
          yellow: '#ffff00',
          pink: '#ff00ff',
          cyan: '#00ffff',
          lime: '#00ff00',
          orange: '#ff8800',
          red: '#ff0000',
          blue: '#0088ff',
          purple: '#8800ff',
        },
        // Core brutalist colors
        primary: '#ffff00', // Bright yellow
        secondary: '#ff00ff', // Magenta
        accent: '#00ffff', // Cyan
        bg: '#1a1a1a', // Off-white
        surface: '#f5f5f5', // Light gray
        text: '#000000', // Pure black
        border: '#000000', // Black borders
        warning: '#ff8800', // Orange
        error: '#ff0000', // Red
        success: '#00ff00', // Lime green
      },
      fontFamily: {
        'brutal': ['Arial', 'Helvetica', 'sans-serif'], // Simple, bold fonts
        'mono': ['Courier New', 'monospace'],
      },
      fontSize: {
        'brutal-xl': ['2rem', { lineHeight: '1.1', fontWeight: '700' }],
        'brutal-lg': ['1.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'brutal-md': ['1rem', { lineHeight: '1.3', fontWeight: '600' }],
        'brutal-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'none': '0px', // Sharp corners
        'brutal': '8px', // Increased rounding
        'brutal-lg': '12px', // Larger rounding for bigger elements
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px #000000',
        'brutal-sm': '3px 3px 0px 0px #000000',
        'brutal-lg': '8px 8px 0px 0px #000000',
        'brutal-hover': '2px 2px 0px 0px #000000',
        'brutal-inset': 'inset 3px 3px 0px 0px #000000',
        'brutal-soft': '4px 4px 8px rgba(0, 0, 0, 0.2)',
        'brutal-card': '6px 6px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'brutal-pulse': 'brutal-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'brutal-bounce': 'brutal-bounce 1s infinite',
      },
      keyframes: {
        'brutal-pulse': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'brutal-bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      spacing: {
        'brutal': '8px',
      },
    },
  },
  plugins: [],
} 