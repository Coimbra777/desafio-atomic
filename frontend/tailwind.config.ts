import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4efe5',
        ink: '#1b1f1d',
        ember: '#ad5d3d',
        pine: '#28594d',
        sand: '#e4d7bf',
        mist: '#c9d6d1',
      },
      boxShadow: {
        card: '0 24px 50px rgba(27, 31, 29, 0.14)',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top left, rgba(173, 93, 61, 0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(40, 89, 77, 0.18), transparent 30%)',
      },
      fontFamily: {
        display: ['"Trebuchet MS"', '"Avenir Next"', 'ui-sans-serif', 'sans-serif'],
        body: ['"Iowan Old Style"', 'Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
