import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Moon, Scale, Sun, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LandingCopy, LandingLang, LandingTheme } from './content'

/** Emblème de l'application (balance) sur pavé vert, comme dans la barre latérale. */
export function BrandMark({ lang, light }: { lang: LandingLang; light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#173D35] text-white shadow-sm ring-1 ring-[#C9A36A]/40">
        <Scale className="h-5 w-5" />
      </span>
      <span className={cn('mf-kufi text-2xl font-semibold leading-none', light ? 'text-white' : 'text-[color:var(--mf-heading)]')}>
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

export function LandingHeader({ copy, lang, onLangChange, theme, onThemeToggle }: HeaderProps) {
  const dark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#features', label: copy.nav.features },
    { href: '#workflow', label: copy.nav.workflow },
    { href: '#documents', label: copy.nav.documents },
    { href: '#ai', label: copy.nav.ai },
    { href: '#faq', label: copy.nav.faq },
  ]

  return (
    <>
      {/* Bandeau supérieur */}
      <div className="bg-[#173D35] text-[13px] text-[#DCE7E1]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
          <span className="hidden sm:inline">{copy.utility}</span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onLangChange('ar')}
              className={cn('mf-kufi px-1 py-1', lang === 'ar' ? 'font-semibold text-white' : 'text-[#DCE7E1] hover:text-white')}
              aria-pressed={lang === 'ar'}
              lang="ar"
            >
              العربية
            </button>
            <span aria-hidden="true" className="opacity-40">
              |
            </span>
            <button
              type="button"
              onClick={() => onLangChange('fr')}
              className={cn('px-1 py-1', lang === 'fr' ? 'font-semibold text-white' : 'text-[#DCE7E1] hover:text-white')}
              aria-pressed={lang === 'fr'}
              lang="fr"
            >
              Français
            </button>
          </span>
        </div>
      </div>

      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-[color:var(--mf-line)] bg-[var(--mf-header)] backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <a href="#top" className="shrink-0">
            <BrandMark lang={lang} />
          </a>
          <nav aria-label={copy.menu} className="hidden items-center gap-7 text-[15px] font-medium lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[color:var(--mf-nav)] hover:text-[color:var(--mf-heading)]">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden min-h-[44px] items-center px-3 font-semibold text-[color:var(--mf-heading)] hover:text-[color:var(--mf-heading-hover)] sm:inline-flex"
            >
              {copy.login}
            </Link>
            <a
              href="#contact"
              className="hidden min-h-[44px] items-center rounded-[10px] bg-[var(--mf-btn)] px-5 font-semibold text-white transition-colors hover:bg-[var(--mf-btn-hover)] sm:inline-flex"
            >
              {copy.contactCta}
            </a>
            <button
              type="button"
              onClick={onThemeToggle}
              aria-pressed={dark}
              aria-label={dark ? copy.themeToLight : copy.themeToDark}
              title={dark ? copy.themeToLight : copy.themeToDark}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--mf-line-2)] text-[color:var(--mf-heading)] transition-colors hover:border-[color:var(--mf-hover-line)]"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mf-mobile-nav"
              aria-label={copy.menu}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--mf-line-2)] text-[color:var(--mf-heading)] lg:hidden"
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
              <div className="flex gap-3 py-4">
                <Link
                  to="/login"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border border-[color:var(--mf-line-2)] font-semibold text-[color:var(--mf-heading)]"
                >
                  {copy.login}
                </Link>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] bg-[#173D35] font-semibold text-white"
                >
                  {copy.contactCta}
                </a>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
