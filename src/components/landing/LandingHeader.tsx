import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn, Menu, Moon, Scale, Sun, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LandingCopy, LandingLang, LandingTheme } from './content'

/** Emblème de l'application (balance) sur pavé vert, comme dans la barre latérale. */
export function BrandMark({ lang, tight }: { lang: LandingLang; tight?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173D35] text-white">
        <Scale className="h-5 w-5" />
      </span>
      <span
        className={cn(
          'mf-display text-[22px] font-semibold leading-none text-[color:var(--mf-heading)] sm:text-2xl',
          // Très petits écrans : l'emblème seul, pour garder « Se connecter » et le menu visibles.
          tight && 'hidden min-[380px]:inline',
        )}
      >
        {lang === 'ar' ? 'مفوّض' : 'Mofawid'}
      </span>
    </span>
  )
}

interface HeaderProps {
  copy: LandingCopy
  lang: LandingLang
  onLangChange: (lang: LandingLang) => void
  theme: LandingTheme
  onThemeToggle: () => void
}

const iconBtn =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--mf-line-2)] text-[color:var(--mf-heading)] transition-colors hover:border-[color:var(--mf-hover-line)]'

export function LandingHeader({ copy, lang, onLangChange, theme, onThemeToggle }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const dark = theme === 'dark'
  const otherLang: LandingLang = lang === 'ar' ? 'fr' : 'ar'
  const links = [
    { href: '#features', label: copy.nav.features },
    { href: '#workflow', label: copy.nav.workflow },
    { href: '#documents', label: copy.nav.documents },
    { href: '#ai', label: copy.nav.ai },
    { href: '#faq', label: copy.nav.faq },
  ]

  const langButton = (
    <button
      type="button"
      onClick={() => onLangChange(otherLang)}
      lang={otherLang}
      aria-label={`${copy.langLabel}: ${otherLang === 'ar' ? 'العربية' : 'Français'}`}
      className={cn(iconBtn, 'mf-display text-[15px] font-semibold')}
    >
      {otherLang === 'ar' ? 'ع' : 'FR'}
    </button>
  )
  const themeButton = (
    <button
      type="button"
      onClick={onThemeToggle}
      aria-pressed={dark}
      aria-label={dark ? copy.themeToLight : copy.themeToDark}
      title={dark ? copy.themeToLight : copy.themeToDark}
      className={iconBtn}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--mf-line)] bg-[var(--mf-header)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <a href="#top" className="shrink-0">
          <BrandMark lang={lang} tight />
        </a>

        <nav
          aria-label={copy.menu}
          className="hidden items-center gap-1 rounded-full border border-[color:var(--mf-line)] bg-[var(--mf-surface)] p-1 text-[15px] font-medium lg:flex"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-[color:var(--mf-nav)] transition-colors hover:bg-[var(--mf-tint-green)] hover:text-[color:var(--mf-heading)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 sm:flex">
            {langButton}
            {themeButton}
          </span>
          <Link
            to="/login"
            className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--mf-line-strong)] px-3.5 text-[15px] font-semibold text-[color:var(--mf-heading)] transition-colors hover:border-[color:var(--mf-hover-line)] hover:bg-[var(--mf-tint-green)] sm:px-4"
          >
            <LogIn aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rtl:-scale-x-100" />
            {copy.login}
          </Link>
          <a
            href="#contact"
            className="mf-btn hidden min-h-[44px] items-center whitespace-nowrap rounded-full bg-[var(--mf-btn)] px-5 font-semibold text-white hover:bg-[var(--mf-btn-hover)] md:inline-flex"
          >
            {copy.contactCta}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mf-mobile-nav"
            aria-label={copy.menu}
            className={cn(iconBtn, 'lg:hidden')}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mf-mobile-nav" aria-label={copy.menu} className="border-t border-[color:var(--mf-line)] bg-[var(--mf-bg)] lg:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col px-4 py-2 sm:px-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-[color:var(--mf-line)] py-3 font-medium text-[color:var(--mf-nav)]"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 py-4">
              <span className="flex items-center gap-2 sm:hidden">
                {langButton}
                {themeButton}
              </span>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[var(--mf-btn)] font-semibold text-white"
              >
                {copy.contactCta}
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
