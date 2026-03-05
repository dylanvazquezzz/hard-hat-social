import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:           '#3B82F6',
          'blue-dark':    '#2563EB',
          yellow:         '#FBBF24',
          'yellow-dark':  '#F59E0B',
          dark:           '#0F172A',
          surface:        '#1E293B',
          'text-primary': '#F8FAFC',
          muted:          '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}

export default config
