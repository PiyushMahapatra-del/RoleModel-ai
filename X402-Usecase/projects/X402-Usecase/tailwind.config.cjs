/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Editorial-minimalist design tokens ─────────────────────
        // Ink & alabaster replace the old heavy navy surfaces as the
        // primary text/background pairing. Ochre remains, but is now
        // reserved exclusively for x402 payment triggers.
        ink: {
          DEFAULT: '#121212',
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#c7c7c7',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#3a3a3a',
          700: '#262626',
          800: '#171717',
          900: '#121212',
        },
        alabaster: {
          DEFAULT: '#F9F9F9',
          50: '#FFFFFF',
          100: '#F9F9F9',
          200: '#F1F1EE',
        },
        ochre: {
          DEFAULT: '#D99B21',
          50: '#fdf6e9',
          100: '#f9e6c0',
          200: '#f2ce87',
          300: '#eab553',
          400: '#e2a530',
          500: '#D99B21',
          600: '#b17a17',
          700: '#875c12',
        },
        // Retained as a muted secondary accent (verified/success states,
        // never used for large surfaces or "metallic" chrome).
        sage: {
          DEFAULT: '#838921',
          50: '#f5f6e8',
          100: '#e7e9c4',
          200: '#cfd389',
          300: '#b3b953',
          400: '#9aa02f',
          500: '#838921',
          600: '#666b1a',
          700: '#4c4f14',
        },
        // Legacy tokens kept as aliases so nothing that still references
        // them (e.g. third-party wallet UI) breaks visually.
        navy: {
          DEFAULT: '#121212',
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#c7c7c7',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#3a3a3a',
          700: '#262626',
          800: '#171717',
          900: '#121212',
        },
        cream: {
          DEFAULT: '#F9F9F9',
          50: '#FFFFFF',
          100: '#F9F9F9',
          200: '#F1F1EE',
        },
      },
      fontFamily: {
        // Editorial serif at extreme weight range (300 ultra-light /
        // 900 black) for the brutalist headline contrast.
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest: '0.2em',
      },
      boxShadow: {
        // Deliberately near-invisible — structure comes from borders and
        // whitespace, not elevation.
        hairline: '0 1px 1px rgba(18, 18, 18, 0.03)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        placementPrep: {
          primary: '#121212',
          'primary-content': '#F9F9F9',
          secondary: '#838921',
          'secondary-content': '#F9F9F9',
          accent: '#D99B21',
          'accent-content': '#121212',
          neutral: '#121212',
          'base-100': '#FFFFFF',
          'base-200': '#F9F9F9',
          'base-300': '#F1F1EE',
          info: '#525252',
          success: '#838921',
          warning: '#D99B21',
          error: '#b3261e',
          '--rounded-box': '1rem',
          '--rounded-btn': '999px',
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
}
