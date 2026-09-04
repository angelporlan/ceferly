/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./index.html"],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#ECFDF5',
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          hover: '#059669',
          dark: '#047857',
        },
        amber: {
          50: '#FFFBEB',
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          dark: '#B45309',
        },
        sky: {
          50: '#F0F9FF',
          light: '#E0F2FE',
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          dark: '#0369A1',
        },
        coral: {
          50: '#FEF2F2',
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          dark: '#B91C1C',
        },
        amethyst: {
          50: '#F5F3FF',
          light: '#EDE9FE',
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          dark: '#6D28D9',
        },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        slateText: {
          main: '#1E293B',
          muted: '#64748B',
          light: '#94A3B8',
        },
        ceferlyBorder: {
          DEFAULT: '#E2E8F0',
          dark: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Nunito', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'btn-mint': '0 4px 0 #047857',
        'btn-mint-pressed': '0 1px 0 #047857',
        'btn-amber': '0 4px 0 #B45309',
        'btn-amber-pressed': '0 1px 0 #B45309',
        'btn-sky': '0 4px 0 #0369A1',
        'btn-sky-pressed': '0 1px 0 #0369A1',
        'btn-coral': '0 4px 0 #B91C1C',
        'btn-coral-pressed': '0 1px 0 #B91C1C',
        'btn-amethyst': '0 4px 0 #6D28D9',
        'btn-amethyst-pressed': '0 1px 0 #6D28D9',
        'btn-secondary': '0 4px 0 #CBD5E1',
        'btn-secondary-pressed': '0 1px 0 #CBD5E1',
        'card-3d': '0 4px 0 #E2E8F0',
        'card-hover': '0 6px 0 #CBD5E1',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}

