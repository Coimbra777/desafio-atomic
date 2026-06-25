import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        app: '#f1f3f5',
        paper: '#f4efe5',
        ink: '#1b1f1d',
        ember: '#ad5d3d',
        pine: '#28594d',
        sand: '#e4d7bf',
        mist: '#c9d6d1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        panel: '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
      },
      borderColor: {
        DEFAULT: 'rgba(27,31,29,0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
