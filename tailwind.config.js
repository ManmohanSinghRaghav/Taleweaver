export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Clean Glassmorphism Design System
      backdropBlur: {
        'xs': '2px',
        'sm': '4px', 
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      backgroundColor: {
        // Glass backgrounds with perfect transparency
        'glass-light': 'rgba(255, 255, 255, 0.08)',
        'glass-light-hover': 'rgba(255, 255, 255, 0.12)',
        'glass-light-active': 'rgba(255, 255, 255, 0.16)',
        'glass-dark': 'rgba(255, 255, 255, 0.05)',
        'glass-dark-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-dark-active': 'rgba(255, 255, 255, 0.12)',
      },
      borderColor: {
        'glass-border': 'rgba(255, 255, 255, 0.15)',
        'glass-border-hover': 'rgba(255, 255, 255, 0.25)',
      },
      boxShadow: {
        // Minimal glass shadows
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
        'glass-xl': '0 16px 48px 0 rgba(0, 0, 0, 0.16)',
        'minimal': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'minimal-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
      },
      colors: {
        // Refined minimal palette
        mono: {
          50: '#fafafa',   // Almost white
          100: '#f5f5f5',  // Very light gray
          200: '#e5e5e5',  // Light gray
          300: '#d4d4d4',  // Medium light gray
          400: '#a3a3a3',  // Medium gray
          500: '#737373',  // True gray
          600: '#525252',  // Medium dark gray
          700: '#404040',  // Dark gray
          800: '#262626',  // Very dark gray
          900: '#171717',  // Almost black
          950: '#0a0a0a',  // Pure black
        }
      }
    },
  },
  plugins: [],
}
