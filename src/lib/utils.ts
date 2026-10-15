/** Concatène des classes CSS en ignorant les valeurs falsy. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** Initiales à partir d'un nom complet ou d'un identifiant. */
export function initials(...parts: Array<string | null | undefined>): string {
  const clean = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(' ')
    .trim()
  if (!clean) return '?'
  const words = clean.split(/[\s._-]+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/** Vérifie qu'une chaîne ressemble à un UUID. */
export function isUuid(value: string | undefined): boolean {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

/** Tronque proprement un texte long. */
export function truncate(value: string, max = 120): string {
  if (value.length <= max) return value
  return value.slice(0, max - 1).trimEnd() + '…'
}
