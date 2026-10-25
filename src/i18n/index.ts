import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'
import ar from './ar.json'

export type Lang = 'fr' | 'ar'
export const LANG_KEY = 'mofawid.lang'

// Arabe par défaut ; le choix enregistré (FR) reste prioritaire.
function initialLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'fr' ? 'fr' : 'ar'
  } catch {
    return 'ar'
  }
}

export function applyDocumentLang(lang: Lang): void {
  const el = document.documentElement
  el.lang = lang
  el.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initialLang(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
})

applyDocumentLang(initialLang())

export default i18n
