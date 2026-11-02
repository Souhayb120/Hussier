// rgb(var(--brand-600) / <alpha-value>) : garde les opacités du type bg-canvas/60
const color = (name) => `rgb(var(--${name}) / <alpha-value>)`
const scale = (name, shades) => Object.fromEntries(shades.map((s) => [s, color(`${name}-${s}`)]))
const FULL = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const SHORT = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

/** @type {import('tailwindcss').Config} */
export default {
  // mode sombre : classe "dark" sur <html> (voir src/lib/theme.ts)
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Les couleurs viennent des variables CSS de src/styles/index.css :
      // elles changent quand <html> a la classe "dark" (mode sombre).
      colors: {
        // Vert institutionnel profond (justice / Maroc) — token vert principal.
        brand: scale('brand', FULL),
        // Accent « brass » — or discret (sceaux, papier officiel).
        gold: scale('gold', SHORT),
        // Neutres chauds (encre légèrement verte).
        ink: {
          DEFAULT: color('ink'),
          muted: color('ink-muted'),
          soft: color('ink-soft'),
        },
        // « Papier » : fond ivoire chaud (vert très foncé en sombre).
        canvas: color('canvas'),
        surface: color('surface'),
        line: color('line'),
        // Brique (destructif) — rouge maçonné, réservé aux actions graves.
        red: scale('red', SHORT),
        // Neutres chauds (remplace le slate froid).
        slate: scale('slate', FULL),
        // Info « bleu-vert » atténué (remplace le sky SaaS).
        sky: scale('sky', FULL),
        // Vert « actif » / « réglé » (profond, pour les succès).
        emerald: scale('emerald', FULL),
        // Mauve neutre discret (rares accents, supprimés progressivement).
        violet: scale('violet', SHORT),
      },
      // Le texte a ses propres variables : en sombre, text-brand-700 devient clair
      // alors que bg-brand-700 (boutons, barre latérale) reste foncé.
      textColor: {
        brand: scale('brand-text', FULL),
        gold: scale('gold-text', SHORT),
        red: scale('red-text', SHORT),
        sky: scale('sky-text', FULL),
        emerald: scale('emerald-text', FULL),
        violet: scale('violet-text', SHORT),
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