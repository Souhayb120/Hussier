/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vert institutionnel profond (justice / Maroc) — token vert principal.
        brand: {
          50: '#eef4f1',
          100: '#d8e7df',
          200: '#b3cfc2',
          300: '#8ab1a0',
          400: '#5d907c',
          500: '#3a715b',
          600: '#1d5c47',
          700: '#0b4d3c',
          800: '#0a4133',
          900: '#07382d',
          950: '#042a21',
        },
        // Accent « brass » — or discret (sceaux, papier officiel).
        gold: {
          50: '#faf6ec',
          100: '#f3ead2',
          200: '#e7d8ab',
          300: '#d5bd7a',
          400: '#bd9d55',
          500: '#a8843a',
          600: '#8f6f2d',
          700: '#755a25',
          800: '#5c481f',
          900: '#48391a',
        },
        // Neutres chauds (encre légèrement verte).
        ink: {
          DEFAULT: '#1f2a27',
          muted: '#4a5753',
          soft: '#7c8a84',
        },
        // « Papier » : fond ivoire chaud. canvas = ancien fond, même sémantique.
        canvas: '#f7f5ef',
        surface: '#ffffff',
        line: '#e5e0d4',
        // Brique (destructif) — rouge maçonné, réservé aux actions graves.
        red: {
          50: '#faf0f0',
          100: '#f3dbdb',
          200: '#e2b2b2',
          300: '#cc8585',
          400: '#b55b5b',
          500: '#a63f3f',
          600: '#9b2c2c',
          700: '#822424',
          800: '#6b1d1d',
          900: '#501616',
        },
        // Neutres chauds (remplace le slate froid).
        slate: {
          50: '#f6f4ef',
          100: '#ece8df',
          200: '#ddd7ca',
          300: '#c5bdac',
          400: '#a89e8b',
          500: '#8d836f',
          600: '#71695a',
          700: '#5b5449',
          800: '#46403a',
          900: '#33302a',
          950: '#201e19',
        },
        // Info « bleu-vert » atténué (remplace le sky SaaS).
        sky: {
          50: '#eef4f2',
          100: '#d9e7e3',
          200: '#b6d0c9',
          300: '#8fb4ab',
          400: '#68968c',
          500: '#4e7d73',
          600: '#3d665d',
          700: '#31544c',
          800: '#29453e',
          900: '#20372f',
          950: '#122220',
        },
        // Vert « actif » / « réglé » (profond, pour les succès).
        emerald: {
          50: '#edf5f1',
          100: '#d6e8df',
          200: '#aecfbd',
          300: '#83b198',
          400: '#55907a',
          500: '#36735e',
          600: '#1c5c49',
          700: '#0e4a3b',
          800: '#0a3c30',
          900: '#07382d',
          950: '#042420',
        },
        // Mauve neutre discret (rares accents, supprimés progressivement).
        violet: {
          50: '#f4f1ef',
          100: '#e7e0dc',
          200: '#cfc1b8',
          300: '#b29f92',
          400: '#96806f',
          500: '#7f6960',
          600: '#6b584f',
          700: '#5a4a41',
          800: '#4a3e37',
          900: '#3a312b',
        },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.9375rem' }],
        '22': ['1.375rem', { lineHeight: '1.75rem' }],
        '28': ['1.75rem', { lineHeight: '2.125rem' }],
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Cairo', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
        // Titres de la landing page (style « acte officiel », même police que le PDF).
        display: ['Amiri', '"IBM Plex Sans Arabic"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7, 56, 45, 0.05), 0 6px 16px -8px rgba(7, 56, 45, 0.12)',
        pop: '0 16px 48px -12px rgba(4, 42, 33, 0.28)',
        focus: '0 0 0 3px rgba(11, 77, 60, 0.18)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-end': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Landing page.
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.8) rotate(-18deg)' },
          '60%': { opacity: '1', transform: 'scale(0.92) rotate(-8deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-10deg)' },
        },
        'write-line': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        // Texte arabe qui « s'écrit » de droite à gauche.
        'type-rtl': {
          from: { clipPath: 'inset(0 0 0 100%)' },
          to: { clipPath: 'inset(0 0 0 0)' },
        },
        'sweep': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        'scale-in': 'scale-in 0.18s ease-out both',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-end': 'slide-in-end 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 6s ease-in-out infinite',
        stamp: 'stamp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.9s both',
        'write-line': 'write-line 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'type-rtl': 'type-rtl 0.6s steps(18, end) both',
        sweep: 'sweep 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}