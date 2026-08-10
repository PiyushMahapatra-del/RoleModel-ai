/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Neo-Brutalism Design Tokens ──────────────────────────
        chassis: '#F4F5F0',     // Off-white paper background for the canvas
        panel: '#FFFFFF',       // Pure white for cards, sidebars, and inputs
        
        ink: {
          DEFAULT: '#1E1E1E',   // Stark, almost-black for heavy borders and text
          muted: '#6B7280',     // Secondary grey for labels
        },
        
        accent: {
          DEFAULT: '#E04F43',   // The Brutalist Red accent
          foreground: '#FFFFFF',// Text on accent backgrounds
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
        // Heavy geometric fonts for titles, clean sans for UI, strict mono for labels
        display: ['"Space Grotesk"', '"Clash Display"', 'sans-serif'], 
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest: '0.2em',
      },
      boxShadow: {
        // Neo-Brutalist Hard Shadows (100% opacity, sharp offsets)
        'brutal': '4px 4px 0px 0px #1E1E1E',
        'brutal-lg': '8px 8px 0px 0px #1E1E1E',
        'brutal-active': '0px 0px 0px 0px #1E1E1E', // Replaces shadow when pressed
        
        // Legacy hairline retained for un-migrated elements
        hairline: '0 1px 1px rgba(18, 18, 18, 0.03)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        placementPrep: {
          // DaisyUI theme remapped to the Neo-Brutalist palette
          primary: '#1E1E1E',           // ink
          'primary-content': '#FFFFFF', // white
          secondary: '#6B7280',         // ink-muted
          'secondary-content': '#FFFFFF', 
          accent: '#E04F43',            // brutalist red
          'accent-content': '#FFFFFF',  
          neutral: '#1E1E1E',           // ink
          'base-100': '#FFFFFF',        // panel (white)
          'base-200': '#F4F5F0',        // chassis (off-white)
          'base-300': '#1E1E1E',        // ink borders
          info: '#6B7280',              
          success: '#22c55e',           
          warning: '#D99B21',           
          error: '#E04F43',             
          
          // Flattening out DaisyUI's default curves for structural 90-degree corners
          '--rounded-box': '4px',      
          '--rounded-btn': '4px',       
        },
      },
    ],
    logs: false,
  },
  plugins: [require('daisyui')],
};