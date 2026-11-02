import { useState } from 'react'

/** Thème de l'application (la landing page a le sien : mofawid.landingTheme). */
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'mofawid.theme'

/** Thème choisi par l'utilisateur, sinon celui du système. */
export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Met la classe "dark" sur <html> : toutes les couleurs Tailwind changent (voir index.css). */
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/** Le thème courant et un bouton pour passer de l'un à l'autre (gardé dans le navigateur). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getTheme)

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* noop */
    }
  }

  return { theme, toggle }
}
