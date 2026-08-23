import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          dark: '#15151E',
          surface: '#1E1E2E',
          border: '#2A2A3E',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn Variable', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
