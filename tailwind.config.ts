import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8EDF5',
          100: '#C5D0E6',
          200: '#9EB2D4',
          300: '#7693C2',
          400: '#577DB5',
          500: '#3867A8',
          600: '#1E4D8A',
          700: '#143B6B',
          800: '#09203F',
          900: '#051628',
          DEFAULT: '#09203F',
        },
        department: {
          sales: '#B3D9FF',
          'sales-dark': '#3b82f6',
          operations: '#B3F1D1',
          'operations-dark': '#10b981',
          finance: '#FFE4B3',
          'finance-dark': '#f59e0b',
          hr: '#F4D4E8',
          'hr-dark': '#ec4899',
          tech: '#DFD4FF',
          'tech-dark': '#8b5cf6',
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        serif: ['var(--font-serif)'],
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'luxury': '0 20px 25px -5px rgba(9, 32, 63, 0.08)',
        'luxury-lg': '0 25px 50px -12px rgba(9, 32, 63, 0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
