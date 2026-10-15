import { useId } from 'react'

/**
 * Motif géométrique subtil (étoile à 8 branches à entrelacs discrets),
 * dessiné en `currentColor`. L'intensité se règle via opacity/className.
 * À utiliser avec parcimonie (panneau de connexion, bannières, en-têtes de
 * documents) — jamais derrière des tableaux ou des formulaires.
 */
export function GeometricPattern({
  className,
  size = 56,
}: {
  className?: string
  size?: number
}) {
  const id = useId()
  return (
    <svg aria-hidden="true" className={className} focusable="false">
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M${size / 2} 2l${size * 0.14} ${size * 0.26} ${size * 0.26} ${size * 0.14}-${size * 0.26} ${size * 0.14}-${size * 0.14} ${size * 0.26}-${size * 0.14}-${size * 0.26}L${size / 2 - size * 0.26} ${size / 2 + size * 0.14}l-${size * 0.26} ${size * 0.14}${size * 0.26} ${size * 0.14}${size * 0.14} ${size * 0.26}${size * 0.14}-${size * 0.26}${size * 0.26}-${size * 0.14}V${size / 2 + size * 0.14}l${size * 0.26}-${size * 0.14}v-${size * 0.26}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx={size / 2} cy={size / 2} r={size * 0.07} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}