import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Clock,
  Folder,
  Lock,
  MapPin,
  Play,
  Plus,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { BrandMark } from './LandingHeader'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEMO_VIDEO_URL,
  type LandingCopy,
  type LandingLang,
} from './content'

/* ------------------------------- Shared bits ------------------------------ */

const BRONZE = '#A67C45'

/** Étiquette de section en pastille. */
function Eyebrow({ children, light, center }: { children: ReactNode; light?: boolean; center?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-full px-3.5 py-1 text-sm font-semibold',
        center ? 'self-center' : 'self-start',
        light ? 'bg-[#E2C691]/15 text-[#E2C691]' : 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]',
      )}
    >
      {children}
    </div>
  )
}

function H2({ children, light, className, id }: { children: ReactNode; light?: boolean; className?: string; id?: string }) {
  return (
    <h2
      id={id}
      className={cn(
        'mf-display mf-pre m-0 text-[30px] font-semibold leading-[1.3] sm:text-[36px] lg:text-[42px]',
        light ? 'text-white' : 'text-[color:var(--mf-heading)]',
        className,
      )}
    >
      {children}
    </h2>
  )
}

const Arrow = ({ className }: { className?: string }) => (
  <ArrowRight aria-hidden="true" className={cn('mf-arrow h-[18px] w-[18px] rtl:-scale-x-100', className)} />
)

/** Petite étoile à quatre branches, séparateur du bandeau défilant. */
const Sparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
    <path d="M12 2l2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6z" fill={BRONZE} />
  </svg>
)

const cardBase = 'mf-card mf-rv border border-[color:var(--mf-line)] bg-[var(--mf-surface)]'

/* --------------------------------- Hero ---------------------------------- */

export function HeroSection({ copy }: { copy: LandingCopy }) {
  const h = copy.hero
  const m = h.mock
  return (
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:pb-[72px] lg:pt-20">
        <div className="flex flex-col gap-6">
          <div className="mf-u mf-d1 inline-flex items-center gap-2.5 self-start rounded-full border border-[color:var(--mf-line)] bg-[var(--mf-surface)] py-1.5 pe-3.5 ps-1.5 text-sm font-semibold text-[color:var(--mf-heading)]">
            <span className="rounded-full bg-[#173D35] px-2.5 py-0.5 text-xs text-white">{h.badgeNew}</span>
            {h.badge}
          </div>
          <h1 className="mf-u mf-d2 mf-display m-0 text-[38px] font-semibold leading-[1.18] text-[color:var(--mf-heading)] sm:text-[52px] lg:text-[62px]">
            {h.titleLine1}
            <br />
            {h.titleBefore}
            <span className="text-[#A67C45]">{h.titleHighlight}</span>
            {h.titleAfter}
          </h1>
          <p className="mf-u mf-d3 m-0 max-w-[540px] text-[17px] text-[color:var(--mf-muted)] sm:text-[19px]">{h.lead}</p>
          <div className="mf-u mf-d4 flex flex-wrap gap-3">
            <a
              href="#video"
              className="mf-btn inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-[var(--mf-btn)] px-7 font-semibold text-white hover:bg-[var(--mf-btn-hover)] sm:text-[17px]"
            >
              {h.ctaVideo}
              <Arrow className="text-[#E2C691]" />
            </a>
            <a
              href="#workflow"
              className="inline-flex min-h-[52px] items-center rounded-full border border-[color:var(--mf-line-2)] px-6 font-semibold text-[color:var(--mf-heading)] transition-colors hover:border-[color:var(--mf-hover-line)] sm:text-[17px]"
            >
              {h.ctaHow}
            </a>
          </div>
          <ul className="mf-u mf-d5 m-0 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 text-sm text-[color:var(--mf-muted)]">
            {h.checks.map((c) => (
              <li key={c} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="h-4 w-4 text-[color:var(--mf-green-text)]" strokeWidth={2.6} />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Visuel produit devant une arche */}
        <div className="mf-pop mf-d3 relative mx-auto min-h-[440px] w-full max-w-[560px] sm:min-h-[500px]">
          <div aria-hidden="true" className="absolute inset-y-0 inset-x-[8%] rounded-b-[32px] rounded-t-full bg-[var(--mf-tint-green)]" />
          <div
            aria-hidden="true"
            className="absolute -inset-y-3.5 inset-x-[calc(8%-14px)] rounded-b-[40px] rounded-t-full border border-[#A67C45]/50"
          />

          <div
            role="img"
            aria-label={m.ariaLabel}
            className="absolute inset-x-0 bottom-9 overflow-hidden rounded-[18px] border border-[color:var(--mf-line)] bg-[var(--mf-surface)] shadow-[0_40px_80px_-40px_rgba(15,43,37,0.45)]"
          >
            <div className="flex items-center gap-1.5 border-b border-[color:var(--mf-line-soft)] bg-[var(--mf-bg)] px-3.5 py-2.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-[var(--mf-line-2)]" />
              ))}
              <span dir="ltr" className="ms-2.5 rounded-full border border-[color:var(--mf-line-soft)] bg-[var(--mf-surface)] px-3 text-[11px] text-[color:var(--mf-subtle)]">
                app.mofawid.ma
              </span>
            </div>
            <div className="flex flex-col gap-3.5 p-4 text-[12px] leading-normal sm:p-[18px] sm:text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-[color:var(--mf-subtle)]">{m.date}</div>
                  <div className="mf-display text-[17px] font-semibold text-[color:var(--mf-heading)] sm:text-[18px]">{m.title}</div>
                </div>
                <span className="whitespace-nowrap rounded-full bg-[#173D35] px-3 py-1 text-[11px] font-semibold text-white sm:text-[12px]">{m.newCase}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {m.kpis.map((k, i) => (
                  <div
                    key={k.label}
                    className={cn(
                      'rounded-xl border px-2.5 py-2 sm:px-3',
                      k.pending ? 'border-[color:var(--mf-bronze-soft)] bg-[var(--mf-tint-bronze-2)]' : 'border-[color:var(--mf-line-soft)]',
                    )}
                  >
                    <div className={cn('truncate text-[10px] sm:text-[11px]', k.pending ? 'text-[color:var(--mf-bronze-text)]' : 'text-[color:var(--mf-subtle)]')}>
                      {k.label}
                    </div>
                    <div className={cn('mf-display text-[20px] font-semibold sm:text-[22px]', k.pending && 'text-[color:var(--mf-bronze-text)]')}>
                      {k.value}
                    </div>
                    <div className={cn('h-1 overflow-hidden rounded', k.pending ? 'bg-[var(--mf-bronze-soft)]' : 'bg-[var(--mf-bar)]')}>
                      <div
                        className={cn('mf-fill h-full rounded', k.pending ? 'bg-[#A67C45]' : i === 0 ? 'bg-[#173D35]' : 'bg-[#245748]')}
                        style={{ width: `${k.progress}%`, animationDelay: `${1 + i * 0.2}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--mf-line-soft)] px-3 py-2.5">
                  <span className="min-w-0 truncate">{m.rowDone.label}</span>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--mf-tint-green)] px-2.5 text-[11px] text-[color:var(--mf-green-text)] sm:text-[12px]">
                    {m.rowDone.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--mf-line-soft)] px-3 py-2.5">
                  <span className="min-w-0 truncate">{m.rowSwap.label}</span>
                  <span className="inline-grid shrink-0 whitespace-nowrap text-[11px] sm:text-[12px]">
                    <span className="mf-swap-a rounded-full bg-[var(--mf-tint-bronze)] px-2.5 text-center text-[color:var(--mf-bronze-text)] [grid-area:1/1]">
                      {m.rowSwap.pending}
                    </span>
                    <span className="mf-swap-b rounded-full bg-[#173D35] px-2.5 text-center text-white [grid-area:1/1]">{m.rowSwap.approved}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mf-float absolute start-0 top-6 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-[color:var(--mf-line)] bg-[var(--mf-surface)] py-2 pe-4 ps-2 text-[13px] font-medium shadow-[0_20px_40px_-22px_rgba(15,43,37,0.5)] sm:-start-5 sm:top-[70px] sm:text-sm"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--mf-tint-green)] text-[color:var(--mf-heading)]">
              <MapPin className="h-[15px] w-[15px]" />
            </span>
            {h.chipNote}
          </div>
          <div
            aria-hidden="true"
            className="mf-float-2 absolute end-0 top-[104px] flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#173D35] py-2 pe-4 ps-2 text-[13px] font-medium text-white shadow-[0_20px_40px_-18px_rgba(15,43,37,0.7)] sm:-end-4 sm:top-[150px] sm:text-sm"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#E2C691] text-[#14201C]">
              <Check className="h-[15px] w-[15px]" strokeWidth={2.6} />
            </span>
            {h.chipPdf}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Bandeau défilant -------------------------- */

export function MarqueeStrip({ copy, lang }: { copy: LandingCopy; lang: LandingLang }) {
  const row = (hidden?: boolean) => (
    <span aria-hidden={hidden || undefined} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="inline-flex items-center gap-7 pe-7">
      {copy.marquee.items.map((it) => (
        <span key={it} className="inline-flex items-center gap-7">
          <span>{it}</span>
          <Sparkle />
        </span>
      ))}
    </span>
  )
  return (
    <div aria-label={copy.marquee.label} className="mf-marquee-wrap overflow-hidden border-y border-[color:var(--mf-line)] bg-[var(--mf-surface)]">
      {/* La piste est en LTR pour que la boucle (translateX -50 %) soit identique dans les deux langues. */}
      <div dir="ltr" className="mf-marquee mf-display flex w-max py-[18px] text-[16px] font-medium text-[color:var(--mf-heading)] sm:text-[17px]">
        {row()}
        {row(true)}
      </div>
    </div>
  )
}

/* --------------------------------- Rôles --------------------------------- */

export function RolesSection({ copy }: { copy: LandingCopy }) {
  const badges: { icon: LucideIcon; bg: string }[] = [
    { icon: ShieldCheck, bg: 'bg-[#173D35]' },
    { icon: Folder, bg: 'bg-[#245748]' },
    { icon: MapPin, bg: 'bg-[#A67C45]' },
  ]
  return (
    <section aria-labelledby="mf-roles" className="mx-auto max-w-[1200px] px-4 pb-10 pt-20 sm:px-6 lg:pt-[104px]">
      <div className="mf-rv mb-10 flex max-w-[660px] flex-col gap-3">
        <Eyebrow>{copy.roles.eyebrow}</Eyebrow>
        <H2 id="mf-roles">{copy.roles.title}</H2>
      </div>
      <div className="grid gap-[18px] md:grid-cols-3">
        {copy.roles.items.map((r, i) => {
          const B = badges[i]
          return (
            <div key={r.title} className={cn(cardBase, 'flex flex-col gap-2.5 rounded-3xl p-7')}>
              <span className={cn('flex h-[60px] w-[52px] items-center justify-center rounded-b-[10px] rounded-t-full text-white', B.bg)}>
                <B.icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </span>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="mf-display text-[20px] font-semibold text-[color:var(--mf-heading)] sm:text-[21px]">{r.title}</span>
                <span className="rounded-full bg-[var(--mf-tint-bronze)] px-2.5 text-xs font-semibold text-[color:var(--mf-bronze-text)]">{r.badge}</span>
              </div>
              <p className="m-0 text-base text-[color:var(--mf-muted)]">{r.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------- Fonctionnalités ---------------------------- */

const featureIcons: { icon: LucideIcon; bronze?: boolean }[] = [
  { icon: Folder },
  { icon: ClipboardCheck },
  { icon: MapPin },
  { icon: ShieldCheck, bronze: true },
  { icon: Users },
  { icon: BarChart3 },
]

function TypingLines({ widths, accentIndex }: { widths: string[]; accentIndex?: number }) {
  return (
    <>
      {widths.map((w, i) => (
        <div
          key={i}
          className={cn('mf-type h-[7px] rounded', i === accentIndex ? 'bg-[var(--mf-bronze-soft)]' : 'bg-[var(--mf-bar)]')}
          style={{ width: w, animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </>
  )
}

export function FeaturesSection({ copy }: { copy: LandingCopy }) {
  const f = copy.features
  return (
    <section id="features" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pb-20 pt-16 sm:px-6 lg:pb-[104px] lg:pt-[72px]">
      <div className="mf-rv mb-10 flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[640px] flex-col gap-3">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <H2>{f.title}</H2>
        </div>
        <p className="m-0 max-w-[400px] text-[color:var(--mf-muted)]">{f.lead}</p>
      </div>
      <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
        {/* Carte principale : rédaction assistée par IA */}
        <div className="mf-card mf-rv relative flex flex-wrap items-center gap-7 overflow-hidden rounded-[28px] border border-[#173D35] bg-[#173D35] p-7 text-[#EDF2EF] sm:p-8 md:col-span-2">
          <div aria-hidden="true" className="absolute -bottom-[120px] -start-[60px] h-80 w-[260px] rounded-t-full border border-[#C9A36A] opacity-30" />
          <div className="relative flex min-w-0 flex-[1_1_260px] flex-col gap-2.5">
            <span className="self-start rounded-full bg-[#E2C691] px-3 py-0.5 text-xs font-semibold text-[#14201C]">{f.aiTag}</span>
            <h3 className="mf-display m-0 text-[24px] font-semibold leading-snug text-white sm:text-[26px]">{f.aiTitle}</h3>
            <p className="m-0 text-base text-[#BFD0C8]">{f.aiText}</p>
          </div>
          <div aria-hidden="true" className="relative flex min-w-0 flex-[1_1_220px] flex-col gap-2.5 rounded-2xl bg-[var(--mf-surface)] p-[18px]">
            <div className="mf-display border-b border-[color:var(--mf-line-soft)] pb-1.5 text-center text-sm font-semibold text-[color:var(--mf-heading)]">{f.aiDocTitle}</div>
            <TypingLines widths={['92%', '80%', '88%', '64%']} accentIndex={2} />
          </div>
        </div>

        {f.items.map((item, i) => {
          const I = featureIcons[i]
          return (
            <div key={item.title} className={cn(cardBase, 'flex flex-col gap-2.5 rounded-[28px] p-7')}>
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-[14px]',
                  I.bronze ? 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]' : 'bg-[var(--mf-tint-green)] text-[color:var(--mf-heading)]',
                )}
              >
                <I.icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
              </span>
              <h3 className="m-0 mt-1.5 text-[19px] font-semibold text-[color:var(--mf-text)]">{item.title}</h3>
              <p className="m-0 text-[15px] text-[color:var(--mf-muted)]">{item.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------- Processus ------------------------------- */

export function WorkflowSection({ copy }: { copy: LandingCopy }) {
  const w = copy.workflow
  const last = w.steps.length - 1
  return (
    <section id="workflow" className="scroll-mt-24 px-4 sm:px-6">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-[#173D35] text-[#EDF2EF] sm:rounded-[40px]">
        <div aria-hidden="true" className="absolute -end-20 -top-10 h-[440px] w-[340px] rounded-t-full border border-[#C9A36A] opacity-[0.22]" />
        <div aria-hidden="true" className="absolute -end-10 top-0 h-[400px] w-[260px] rounded-t-full border border-[#C9A36A] opacity-[0.14]" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 sm:px-12 lg:py-[88px]">
          <div className="mf-rv mb-12 flex max-w-[660px] flex-col gap-3 lg:mb-16">
            <Eyebrow light>{w.eyebrow}</Eyebrow>
            <H2 light>{w.title}</H2>
            <p className="m-0 text-[#BFD0C8]">{w.lead}</p>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-x-5 top-[19px] hidden h-0.5 rounded bg-white/10 lg:block" />
            <div aria-hidden="true" className="mf-line absolute inset-x-5 top-[19px] hidden h-0.5 rounded bg-[#C9A36A] lg:block" />
            <ol className="relative m-0 grid list-none gap-9 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-7">
              {w.steps.map((s, i) => {
                const ai = i === last - 1
                const final = i === last
                return (
                  <li key={s.title} className="mf-rv flex flex-col gap-3">
                    <span
                      className={cn(
                        'mf-dot mf-display flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold',
                        ai ? 'border-[#C9A36A] bg-[#C9A36A] text-[#14201C]' : final ? 'border-[#F7F4EC] bg-[#F7F4EC] text-[#173D35]' : 'border-[#C9A36A] bg-[#173D35] text-[#F7F4EC]',
                      )}
                    >
                      {final ? <Check className="h-[18px] w-[18px]" strokeWidth={2.6} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'self-start rounded-full px-2.5 text-xs',
                        ai ? 'bg-[#E2C691] font-semibold text-[#14201C]' : final ? 'bg-[#F7F4EC] font-semibold text-[#173D35]' : 'border border-white/20 text-[#CFE0D8]',
                      )}
                    >
                      {s.role}
                    </span>
                    <h3 className="mf-display m-0 text-[19px] font-semibold text-white">{s.title}</h3>
                    <p className="m-0 text-[15px] text-[#BFD0C8]">{s.text}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Vidéo ---------------------------------- */

export function VideoSection({ copy }: { copy: LandingCopy }) {
  const v = copy.video
  return (
    <section id="video" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pt-20 sm:px-6 lg:pt-[104px]">
      <div className="mf-rv mb-10 flex flex-col items-center gap-3 text-center">
        <Eyebrow center>{v.eyebrow}</Eyebrow>
        <H2>{v.title}</H2>
        <p className="m-0 max-w-[540px] text-[color:var(--mf-muted)]">{v.lead}</p>
      </div>
      <div className="mf-rv mx-auto max-w-[980px] rounded-[32px] border border-[color:var(--mf-line)] bg-[var(--mf-surface)] p-2.5 shadow-[0_40px_80px_-50px_rgba(15,43,37,0.45)] sm:p-3">
        {DEMO_VIDEO_URL ? (
          <video src={DEMO_VIDEO_URL} controls preload="metadata" aria-label={v.label} className="aspect-video w-full rounded-[22px] bg-[#173D35]" />
        ) : (
          <div
            role="img"
            aria-label={v.label}
            className="relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-[#173D35] p-6 text-center text-[#F7F4EC] sm:gap-[18px]"
          >
            <div aria-hidden="true" className="absolute -bottom-[30%] left-1/2 h-[120%] w-[46%] -translate-x-1/2 rounded-t-full border border-[#C9A36A] opacity-20" />
            <span className="mf-pulse relative flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F4EC] text-[#173D35] sm:h-[92px] sm:w-[92px]">
              <Play aria-hidden="true" className="h-7 w-7 fill-current rtl:-scale-x-100 sm:h-8 sm:w-8" />
            </span>
            <div className="mf-display relative text-[18px] font-semibold sm:text-[20px]">{v.label}</div>
            <div className="relative rounded-full border border-dashed border-[#C9A36A]/70 px-4 py-1 text-[13px] text-[#BFD0C8] sm:text-sm">{v.placeholder}</div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------------------- Procès-verbaux ----------------------------- */

export function DocumentsSection({ copy }: { copy: LandingCopy }) {
  const d = copy.documents
  return (
    <section id="documents" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-20 sm:px-6 lg:py-[104px]">
      <div className="mf-rv mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[660px] flex-col gap-3">
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <H2>{d.title}</H2>
        </div>
        <p className="m-0 max-w-[420px] text-[color:var(--mf-muted)]">{d.lead}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {d.items.map((doc, i) => {
          const notif = doc.family === 'notification'
          return (
            <article key={doc.title} className={cn(cardBase, 'flex flex-col gap-2 rounded-[22px] p-6')}>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-2.5 text-xs font-semibold',
                    notif ? 'bg-[var(--mf-tint-green)] text-[color:var(--mf-green-text)]' : 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]',
                  )}
                >
                  {doc.tag}
                </span>
                <span className="mf-display text-[13px] text-[color:var(--mf-faint)]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mf-display m-0 mt-1.5 text-[19px] font-semibold text-[color:var(--mf-heading)]">{doc.title}</h3>
              <p className="m-0 text-[15px] text-[color:var(--mf-muted)]">{doc.text}</p>
            </article>
          )
        })}
        <a
          href="#video"
          className="mf-card mf-rv flex flex-col items-center justify-center gap-3.5 rounded-b-[22px] rounded-t-full border border-[#173D35] bg-[#173D35] px-6 pb-6 pt-16 text-center text-[#F7F4EC]"
        >
          <span className="mf-display text-[20px] font-semibold leading-snug">{d.ctaTitle}</span>
          <span className="inline-flex items-center gap-2 font-semibold text-[#E2C691]">
            {d.cta}
            <Arrow className="h-4 w-4" />
          </span>
        </a>
      </div>
    </section>
  )
}

/* ------------------------------ Assistant IA ----------------------------- */

export function AiSection({ copy }: { copy: LandingCopy }) {
  const a = copy.ai
  return (
    <section id="ai" className="scroll-mt-24 border-y border-[color:var(--mf-line)] bg-[var(--mf-surface)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-[72px] lg:py-[104px]">
        <div className="mf-rv flex flex-col gap-5">
          <Eyebrow>{a.eyebrow}</Eyebrow>
          <H2>{a.title}</H2>
          <p className="m-0 text-[color:var(--mf-muted)]">{a.lead}</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {a.points.map((p, i) => {
              const bronze = i === a.points.length - 1
              return (
                <li key={p.strong} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      bronze ? 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]' : 'bg-[var(--mf-tint-green)] text-[color:var(--mf-heading)]',
                    )}
                  >
                    <Check className="h-[13px] w-[13px]" strokeWidth={3} />
                  </span>
                  <span>
                    <b className="font-semibold">{p.strong}</b> {p.text}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="m-0 mt-1 border-t border-[color:var(--mf-line)] pt-3.5 text-sm text-[color:var(--mf-muted)]">{a.disclaimer}</p>
        </div>

        <div role="img" aria-label={a.doc.ariaLabel} className="mf-rv relative py-7">
          <div aria-hidden="true" className="absolute inset-y-0 inset-x-[10%] rounded-b-[32px] rounded-t-full bg-[var(--mf-tint-green)]" />
          <div className="relative mx-[4%] flex flex-col gap-3 rounded-[18px] border border-[color:var(--mf-line)] bg-[var(--mf-paper)] px-6 py-7 shadow-[0_30px_60px_-36px_rgba(20,32,28,0.4)] sm:mx-[6%] sm:px-7">
            <div className="flex justify-between gap-2 text-xs text-[color:var(--mf-subtle)]">
              <span>{a.doc.caseRef}</span>
              <span className="rounded-full bg-[var(--mf-tint-bronze)] px-2.5 font-semibold text-[color:var(--mf-bronze-text)]">{a.doc.badge}</span>
            </div>
            <div className="mf-display border-b border-[color:var(--mf-line-soft)] pb-2.5 pt-1 text-center text-[20px] font-semibold text-[color:var(--mf-text-strong)] sm:text-[22px]">
              {a.doc.title}
            </div>
            <TypingLines widths={['94%', '82%']} />
            <div className="flex flex-col gap-2 rounded-[10px] border border-dashed border-[#C9A36A] bg-[var(--mf-tint-bronze-3)] p-3">
              <div className="text-xs font-semibold text-[color:var(--mf-bronze-text)]">{a.doc.source}</div>
              <div className="mf-type h-2 rounded bg-[var(--mf-bronze-soft)]" style={{ width: '96%', animationDelay: '0.5s' }} />
              <div className="mf-type h-2 rounded bg-[var(--mf-bronze-soft)]" style={{ width: '70%', animationDelay: '0.75s' }} />
            </div>
            <div className="mf-type h-2 rounded bg-[var(--mf-bar)]" style={{ width: '88%', animationDelay: '1s' }} />
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5">
              <span className="border-t border-[color:var(--mf-faint)] pt-1.5 text-xs text-[color:var(--mf-subtle)]">{a.doc.signature}</span>
              <span className="inline-flex gap-2">
                <span className="rounded-full border border-[color:var(--mf-line-2)] px-3.5 py-1.5 text-[13px] font-semibold text-[color:var(--mf-heading)]">{a.changes}</span>
                <span className="rounded-full bg-[#173D35] px-4 py-1.5 text-[13px] font-semibold text-white">{a.approve}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Confiance ------------------------------ */

export function TrustSection({ copy }: { copy: LandingCopy }) {
  const icons = [Lock, Clock, ShieldCheck, Server]
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-[104px]">
      <H2 className="mf-rv mb-10 max-w-[640px] !text-[28px] sm:!text-[34px] lg:!text-[38px]">{copy.trust.title}</H2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {copy.trust.items.map((t, i) => {
          const Icon = icons[i]
          return (
            <div key={t.title} className={cn(cardBase, 'flex flex-col gap-2.5 rounded-[22px] p-[26px]')}>
              <Icon aria-hidden="true" className="h-[26px] w-[26px] text-[color:var(--mf-heading)]" strokeWidth={1.6} />
              <h3 className="m-0 text-[18px] font-semibold text-[color:var(--mf-text)]">{t.title}</h3>
              <p className="m-0 text-[15px] text-[color:var(--mf-muted)]">{t.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------------------------- FAQ ---------------------------------- */

export function FaqSection({ copy }: { copy: LandingCopy }) {
  return (
    <section id="faq" className="mx-auto max-w-[860px] scroll-mt-24 px-4 pb-20 sm:px-6 lg:pb-[104px]">
      <H2 className="mf-rv mb-7 text-center !text-[28px] sm:!text-[34px] lg:!text-[38px]">{copy.faq.title}</H2>
      <div className="flex flex-col gap-2.5">
        {copy.faq.items.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-[18px] border border-[color:var(--mf-line)] bg-[var(--mf-surface)] px-5 py-3 sm:px-[22px] sm:py-4"
          >
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold sm:text-[18px] [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus aria-hidden="true" className="h-5 w-5 shrink-0 text-[#A67C45] transition-transform group-open:rotate-45" />
            </summary>
            <p className="m-0 mb-1 mt-1 text-[color:var(--mf-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------- Contact -------------------------------- */

const inputCls =
  'min-h-[46px] w-full rounded-[14px] border border-[color:var(--mf-line-2)] bg-[var(--mf-input)] px-4 py-2.5 font-normal text-[color:var(--mf-text)] focus:border-[color:var(--mf-hover-line)]'

export function ContactSection({ copy, lang }: { copy: LandingCopy; lang: LandingLang }) {
  const c = copy.contact
  const [missing, setMissing] = useState(false)

  // Pas d'API de contact côté backend : le message est préparé dans le client e-mail.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!CONTACT_EMAIL) {
      setMissing(true)
      return
    }
    const data = new FormData(e.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()
    const body = [
      `${c.name}: ${get('name')}`,
      `${c.office}: ${get('office')}`,
      `${c.email}: ${get('email')}`,
      `${c.phone}: ${get('phone')}`,
      '',
      get('message'),
    ].join('\n')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Mofawid — ${get('subject')}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="contact" className="scroll-mt-24 px-4 pb-20 sm:px-6 lg:pb-[104px]">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-[#173D35] sm:rounded-[40px]">
        <div aria-hidden="true" className="absolute -bottom-[60px] end-[6%] hidden h-[420px] w-[300px] rounded-t-full border border-[#C9A36A] opacity-25 lg:block" />
        <div className="relative grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-[72px]">
          <div className="mf-rv flex flex-col gap-4 text-[#EDF2EF]">
            <Eyebrow light>{c.eyebrow}</Eyebrow>
            <H2 light>{c.title}</H2>
            <p className="m-0 text-[#BFD0C8]">{c.lead}</p>
            {(CONTACT_EMAIL || CONTACT_PHONE) && (
              <div className="flex flex-col gap-1.5 text-[15px]">
                {CONTACT_EMAIL && (
                  <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="self-start text-[#DCE7E1] hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                )}
                {CONTACT_PHONE && (
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} dir="ltr" className="self-start text-[#DCE7E1] hover:text-white">
                    {CONTACT_PHONE}
                  </a>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="mf-rv grid gap-3.5 rounded-[28px] bg-[var(--mf-surface)] p-5 text-[color:var(--mf-text)] sm:grid-cols-2 sm:p-[30px]">
            <label className="flex flex-col gap-1.5 text-[15px] font-medium">
              {c.name}
              <input name="name" required autoComplete="name" placeholder={c.namePlaceholder} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px] font-medium">
              {c.office}
              <input name="office" autoComplete="organization" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px] font-medium">
              {c.email}
              <input name="email" type="email" required autoComplete="email" dir="ltr" className={cn(inputCls, lang === 'ar' && 'text-right')} />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px] font-medium">
              <span>
                {c.phone} <span className="text-[13px] font-normal text-[color:var(--mf-subtle)]">{c.optional}</span>
              </span>
              <input name="phone" type="tel" autoComplete="tel" dir="ltr" className={cn(inputCls, lang === 'ar' && 'text-right')} />
            </label>
            <label className="flex flex-col gap-1.5 text-[15px] font-medium sm:col-span-2">
              {c.subject}
              <select name="subject" className={inputCls}>
                {c.subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[15px] font-medium sm:col-span-2">
              {c.message}
              <textarea name="message" required rows={4} placeholder={c.messagePlaceholder} className={cn(inputCls, 'resize-y')} />
            </label>
            <button
              type="submit"
              className="mf-btn inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[var(--mf-btn)] p-3.5 text-[17px] font-semibold text-white hover:bg-[var(--mf-btn-hover)] sm:col-span-2"
            >
              {c.submit}
              <Arrow className="text-[#E2C691]" />
            </button>
            {missing && (
              <p role="status" className="m-0 text-center text-[13px] font-medium text-[color:var(--mf-error)] sm:col-span-2">
                {c.missingEmail}
              </p>
            )}
            <p className="m-0 text-center text-[13px] text-[color:var(--mf-muted)] sm:col-span-2">{c.privacy}</p>
          </form>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Footer -------------------------------- */

export function LandingFooter({ copy, lang }: { copy: LandingCopy; lang: LandingLang }) {
  const f = copy.footer
  const linkCls = 'text-[color:var(--mf-muted)] hover:text-[color:var(--mf-heading)]'
  return (
    <footer className="border-t border-[color:var(--mf-line)]">
      <div className="mx-auto grid max-w-[1200px] gap-9 px-4 pb-6 pt-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <BrandMark lang={lang} />
          <p className="m-0 max-w-[380px] text-[15px] text-[color:var(--mf-muted)]">{f.tagline}</p>
        </div>
        <nav aria-label={f.platform} className="flex flex-col gap-2 text-[15px]">
          <div className="text-sm font-semibold text-[color:var(--mf-heading)]">{f.platform}</div>
          <a href="#features" className={linkCls}>{copy.nav.features}</a>
          <a href="#workflow" className={linkCls}>{copy.nav.workflow}</a>
          <a href="#documents" className={linkCls}>{copy.nav.documents}</a>
        </nav>
        <nav aria-label={f.contact} className="flex flex-col gap-2 text-[15px]">
          <div className="text-sm font-semibold text-[color:var(--mf-heading)]">{f.contact}</div>
          <a href="#video" className={linkCls}>{copy.video.eyebrow}</a>
          <a href="#contact" className={linkCls}>{copy.contactCta}</a>
          <Link to="/login" className={linkCls}>{copy.login}</Link>
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-[color:var(--mf-line)] px-4 pb-8 pt-5 text-[13px] text-[color:var(--mf-subtle)] sm:px-6">
        <span>
          © {new Date().getFullYear()} {lang === 'ar' ? 'مفوّض' : 'Mofawid'}. {f.rights}
        </span>
        <span className="flex gap-5">
          <a href="#legal" className={linkCls}>{f.legal}</a>
          <a href="#privacy" className={linkCls}>{f.privacy}</a>
        </span>
      </div>
    </footer>
  )
}
