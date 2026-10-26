import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANG_KEY, applyDocumentLang } from '../i18n'
import { LandingHeader } from '../components/landing/LandingHeader'
import {
  AiSection,
  ContactSection,
  DocumentsSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  LandingFooter,
  MarqueeStrip,
  RolesSection,
  TrustSection,
  VideoSection,
  WorkflowSection,
} from '../components/landing/LandingSections'
import { LANDING_COPY, type LandingLang, type LandingTheme } from '../components/landing/content'
import '../components/landing/landing.css'

/**
 * Page publique « / » (visiteurs non connectés).
 * Arabe par défaut (RTL), bascule FR via le sélecteur de langue.
 * Les chiffres du tableau de bord affiché sont fictifs.
 */
const THEME_KEY = 'mofawid.landingTheme'

/** Thème choisi par le visiteur, sinon celui du système. */
function initialTheme(): LandingTheme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function LandingPage() {
  const { i18n } = useTranslation()
  const lang: LandingLang = i18n.language.startsWith('fr') ? 'fr' : 'ar'
  const copy = LANDING_COPY[lang]
  const [theme, setTheme] = useState<LandingTheme>(initialTheme)

  const toggleTheme = () => {
    const next: LandingTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* noop */
    }
  }

  const changeLang = (next: LandingLang) => {
    void i18n.changeLanguage(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* noop */
    }
    applyDocumentLang(next)
  }

  return (
    <div
      data-theme={theme}
      className="mf-root min-h-screen overflow-x-clip bg-[var(--mf-bg)] text-[17px] leading-[1.75] text-[color:var(--mf-text)]"
    >
      <LandingHeader
        copy={copy}
        lang={lang}
        onLangChange={changeLang}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <main>
        <HeroSection copy={copy} />
        <MarqueeStrip copy={copy} lang={lang} />
        <RolesSection copy={copy} />
        <FeaturesSection copy={copy} />
        <WorkflowSection copy={copy} />
        <VideoSection copy={copy} />
        <DocumentsSection copy={copy} />
        <AiSection copy={copy} />
        <TrustSection copy={copy} />
        <FaqSection copy={copy} />
        <ContactSection copy={copy} lang={lang} />
      </main>
      <LandingFooter copy={copy} lang={lang} />
    </div>
  )
}
