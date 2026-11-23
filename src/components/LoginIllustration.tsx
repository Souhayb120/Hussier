/**
 * Illustration du panneau de connexion : arc outrepassé marocain, balance de la justice
 * et pile d'actes officiels scellés à la cire. Décorative (le texte à côté porte le sens).
 * Couleurs = jetons de la palette (gold, brand, red) : elle suit tout changement de palette.
 */
export function LoginIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 250"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* lueur laiton derrière l'arc */}
      <defs>
        <radialGradient id="login-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" className="[stop-color:rgb(var(--gold-400))]" stopOpacity="0.28" />
          <stop offset="100%" className="[stop-color:rgb(var(--gold-400))]" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="120" rx="150" ry="118" fill="url(#login-glow)" />

      {/* arc outrepassé (« fer à cheval ») : fond plus profond + double filet laiton */}
      <path d="M96 236V140A70 70 0 1 1 224 140V236Z" className="fill-brand-950/60" />
      <path d="M96 236V140A70 70 0 1 1 224 140V236" className="stroke-gold-400" strokeWidth="3" />
      <path d="M108 236V140A58 58 0 1 1 212 140V236" className="stroke-gold-400/40" strokeWidth="1.5" />

      {/* drapeau du Maroc sur un mât laiton, à gauche de l'arc.
          Couleurs officielles fixes (pas des jetons) : un drapeau ne suit pas la palette. */}
      <path d="M72 236V58" className="stroke-gold-300" strokeWidth="2.5" />
      <circle cx="72" cy="56" r="3.5" className="fill-gold-300" />
      <path d="M73 62C84 57 98 67 118 61V93C98 99 84 89 73 94Z" fill="#C1272D" />
      {/* pentagramme vert (étoile à cinq branches entrelacée) */}
      <path
        d="M95 67L100.9 85.1L85.5 73.9H104.5L89.1 85.1Z"
        stroke="#006233"
        strokeWidth="1.8"
        strokeLinejoin="miter"
      />

      {/* étoile à huit branches (zellige) à la clé de l'arc */}
      <g transform="translate(160 26)" className="fill-gold-400">
        <rect x="-7" y="-7" width="14" height="14" />
        <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" />
        <circle r="3" className="fill-brand-900" />
      </g>

      {/* balance de la justice */}
      <g className="stroke-gold-300" strokeWidth="2.5">
        <path d="M160 82V182" />
        <path d="M120 96H200" />
        <path d="M144 186H176" strokeWidth="4" />
        {/* plateaux suspendus */}
        <path d="M124 98L110 134M124 98L138 134" strokeWidth="1.5" />
        <path d="M196 98L182 134M196 98L210 134" strokeWidth="1.5" />
      </g>
      <circle cx="160" cy="80" r="5" className="fill-gold-300" />
      <path d="M106 134H142A18 9 0 0 1 106 134Z" className="fill-gold-400" />
      <path d="M178 134H214A18 9 0 0 1 178 134Z" className="fill-gold-400" />

      {/* pile d'actes officiels */}
      <g transform="rotate(-4 160 214)">
        <rect x="104" y="196" width="112" height="34" rx="3" className="fill-white/25" />
      </g>
      <rect x="100" y="190" width="120" height="40" rx="3" className="fill-white/90" />
      <g className="stroke-brand-900/35" strokeWidth="2">
        <path d="M112 202H176" />
        <path d="M112 211H190" />
        <path d="M112 220H160" />
      </g>
      {/* cachet de cire rouge sur anneau laiton, avec ruban */}
      <path d="M198 222L192 240M206 222L212 240" className="stroke-red-600" strokeWidth="4" />
      <circle cx="202" cy="216" r="13" className="fill-gold-400" />
      <circle cx="202" cy="216" r="10" className="fill-red-600" />
      <circle cx="202" cy="216" r="5" className="stroke-white/50" strokeWidth="1.2" />

      {/* sol */}
      <path d="M60 236H260" className="stroke-gold-400/50" strokeWidth="1.5" />
    </svg>
  )
}
