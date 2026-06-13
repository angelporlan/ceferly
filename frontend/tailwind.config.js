/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: 'var(--text)',
        'text-h': 'var(--text-h)',
        bg: 'var(--bg)',
        border: 'var(--border)',
        'code-bg': 'var(--code-bg)',
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-border': 'var(--accent-border)',
        'social-bg': 'var(--social-bg)',
      },
      fontFamily: {
        sans: ['var(--sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--heading)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        custom: 'var(--shadow)',
      },
      // Premium custom typography configurations
      letterSpacing: {
        tight: '-0.01em',
        tighter: '-0.02em',
        tightest: '-0.03em',
        wide: '0.025em',
      },
      lineHeight: {
        tight: '1.15',
        premium: '1.25',
        relaxed: '1.6',
      }
    },
  },
  plugins: [],
}
