/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Industrial Skeuomorphism Design Tokens ─────────────────
        chassis: '#e0e5ec',     // Base industrial grey (Level 0)
        panel: '#f0f2f5',       // Lighter raised surface (Level +1)
        recessed: '#d1d9e6',    // Darker sunken areas (Level -1)
        
        ink: {
          DEFAULT: '#2d3436',   // Primary dark charcoal text
          muted: '#4a5568',     // Secondary slate grey text/labels
        },
        
        accent: {
          DEFAULT: '#ff4757',   // Safety Orange / Braun Red
          foreground: '#ffffff',// Text on accent
        },

        // ─── Legacy Aliases ─────────────────────────────────────────
        // Retained to ensure third-party wallet UI and un-migrated 
        // components do not break during the transition.
        navy: {
          DEFAULT: '#121212',
          50: '#f5f5f5', 100: '#e8e8e8', 200: '#c7c7c7', 300: '#a3a3a3',
          400: '#737373', 500: '#525252', 600: '#3a3a3a', 700: '#262626',
          800: '#171717', 900: '#121212',
        },
        cream: {
          DEFAULT: '#F9F9F9',
          50: '#FFFFFF', 100: '#F9F9F9', 200: '#F1F1EE',
        },
        ochre: {
          DEFAULT: '#D99B21',
          50: '#fdf6e9', 100: '#f9e6c0', 200: '#f2ce87', 300: '#eab553',
          400: '#e2a530', 500: '#D99B21', 600: '#b17a17', 700: '#875c12',
        },
        sage: {
          DEFAULT: '#838921',
          50: '#f5f6e8', 100: '#e7e9c4', 200: '#cfd389', 300: '#b3b953',
          400: '#9aa02f', 500: '#838921', 600: '#666b1a', 700: '#4c4f14',
        }
      },
      fontFamily: {
        // Updated to the Industrial typography stack
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest: '0.2em',
      },
      boxShadow: {
        // Industrial Physics Engine Shadows (maps to your index.css root variables)
        card: 'var(--shadow-card)',
        floating: 'var(--shadow-floating)',
        pressed: 'var(--shadow-pressed)',
        recessed: 'var(--shadow-recessed)',
        glow: '0 0 10px 2px rgba(255, 71, 87, 0.6)',
        // Legacy hairline retained for un-migrated elements
        hairline: '0 1px 1px rgba(18, 18, 18, 0.03)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        placementPrep: {
          // DaisyUI theme remapped to the Industrial palette
          primary: '#2d3436',           // ink
          'primary-content': '#e0e5ec', // chassis
          secondary: '#4a5568',         // ink-muted
          'secondary-content': '#f0f2f5', // panel
          accent: '#ff4757',            // safety orange
          'accent-content': '#ffffff',  
          neutral: '#2d3436',           // ink
          'base-100': '#e0e5ec',        // chassis (Base background)
          'base-200': '#d1d9e6',        // recessed
          'base-300': '#babecc',        // border shadow color
          info: '#4a5568',              // ink-muted
          success: '#22c55e',           // standard green for LED success
          warning: '#D99B21',           // legacy ochre
          error: '#ff4757',             // safety orange used for alerts
          '--rounded-box': '1rem',      // xl mechanical edges
          '--rounded-btn': '0.5rem',    // md radius for tactile buttons
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
};