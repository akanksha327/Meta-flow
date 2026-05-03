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
        primary: {
          DEFAULT: '#111827', // Deep charcoal
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        accent: {
          DEFAULT: '#D97706', // Muted amber
          light: '#F59E0B',
          dark: '#B45309',
        },
        surface: {
          DEFAULT: '#F9F7F3', // Soft beige
          card: '#FFFFFF',
          dark: '#0B0F14',
          cardDark: '#111827',
        },
        textPrimary: {
          DEFAULT: '#1F2937',
          dark: '#E5E7EB',
        },
        textSecondary: {
          DEFAULT: '#6B7280',
          dark: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
