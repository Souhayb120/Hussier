import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Circle, Clock, Lock, Play, Plus, Server, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import { BrandMark } from './LandingHeader'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEMO_VIDEO_URL,
  type LandingCopy,
  type LandingLang,
} from './content'

/* --------------------------------- Décor --------------------------------- */

/** Arche outrepassée (fer à cheval), en coordonnées 0–1. */
const ARCH_PATH = 'M0.0652,1 V0.614 A0.5,0.4107 0 1,1 0.9348,0.614 V1'

const GREEN = '#173D35'
const BRONZE = '#A67C45'
const BRONZE_LIGHT = '#C9A36A'

/** Trame zellige (étoile à 8 branches) en fond d'un bloc positionné. */
function Zellige({ id, size = 60, opacity = 0.2 }: { id: string; size?: number; opacity?: number }) {
  const c = size / 2
  const s = size / 3
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={BRONZE_LIGHT} strokeWidth="1">
            <rect x={c - s / 2} y={c - s / 2} width={s} height={s} />
            <rect x={c - s / 2} y={c - s / 2} width={s} height={s} transform={`rotate(45 ${c} ${c})`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  )
}

/** Frise zellige horizontale séparant les sections. */
function Frieze({ id, dark }: { id: string; dark?: boolean }) {
  return (
    <div aria-hidden="true" className={cn('h-[30px]', dark ? 'bg-[var(--mf-deep)]' : 'bg-[#173D35]')}>
      <svg className="block h-full w-full">
        <defs>
          <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
            <g fill="none" stroke={BRONZE_LIGHT} strokeWidth="1">
              <rect x="8" y="8" width="14" height="14" />
              <rect x="8" y="8" width="14" height="14" transform="rotate(45 15 15)" />
            </g>
            <circle cx="15" cy="15" r="2" fill="#F7F4EC" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} opacity={dark ? 0.7 : 1} />
      </svg>
    </div>
  )
}

/** Étoile à 8 branches numérotée (étapes du processus). */
function StarStep({ n, variant }: { n: number; variant: 'outline' | 'bronze' | 'ivory' }) {
  const fill = variant === 'outline' ? GREEN : variant === 'bronze' ? BRONZE_LIGHT : '#F7F4EC'
  const stroke = variant === 'ivory' ? '#F7F4EC' : BRONZE_LIGHT
  const text = variant === 'outline' ? '#F7F4EC' : variant === 'bronze' ? '#14201C' : GREEN
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="relative bg-[#173D35]">
      <g fill={fill} stroke={stroke} strokeWidth="1.4">
        <rect x="10" y="10" width="24" height="24" />
        <rect x="10" y="10" width="24" height="24" transform="rotate(45 22 22)" />
      </g>
      <text x="22" y="27" textAnchor="middle" fontSize="14" fill={text} className="mf-kufi">
        {n}
      </text>
    </svg>
  )
}

function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return <div className={cn('text-[15px] font-semibold', light ? 'text-[#E2C691]' : 'text-[color:var(--mf-bronze-text)]')}>{children}</div>
}

function H2({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) {
  return (
    <h2
      className={cn(
        'mf-kufi mf-pre m-0 text-[30px] font-semibold leading-[1.35] sm:text-[36px] lg:text-[42px]',
        light ? 'text-white' : 'text-[color:var(--mf-heading)]',
        className,
      )}
    >
      {children}
    </h2>
  )
}

const Arrow = ({ className }: { className?: string }) => (
  <ArrowRight aria-hidden="true" className={cn('h-4 w-4 rtl:-scale-x-100', className)} />
)

/* --------------------------------- Hero ---------------------------------- */

export function HeroSection({ copy }: { copy: LandingCopy }) {
  const h = copy.hero
  return (
    <section id="top" className="relative overflow-hidden">
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <clipPath id="mf-arch-clip" clipPathUnits="objectBoundingBox">
            <path d={`${ARCH_PATH} Z`} />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:pb-24 lg:pt-[72px]">
        <div className="flex flex-col gap-6">
          <div className="mf-u mf-d1 inline-flex items-center gap-3 text-[15px] font-semibold text-[color:var(--mf-bronze-text)]">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
              <g fill="none" stroke={BRONZE} strokeWidth="1.6">
                <rect x="6" y="6" width="12" height="12" />
                <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
              </g>
            </svg>
            {h.eyebrow}
          </div>
          <h1 className="mf-u mf-d2 mf-kufi mf-pre m-0 text-[36px] font-semibold leading-[1.3] text-[color:var(--mf-heading)] sm:text-[48px] lg:text-[58px]">
            {h.titleBefore}
            <span className="mf-highlight">{h.titleHighlight}</span>
            {h.titleAfter}
          </h1>
          <p className="mf-u mf-d3 m-0 max-w-[540px] text-[17px] leading-relaxed text-[color:var(--mf-muted)] sm:text-[19px]">{h.lead}</p>
          <div className="mf-u mf-d4 flex flex-wrap gap-3">
            <a
              href="#video"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-[var(--mf-btn)] px-6 font-semibold text-white transition-colors hover:bg-[var(--mf-btn-hover)] sm:text-[17px]"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-[#E2C691] text-[#E2C691] rtl:-scale-x-100" />
              {h.ctaVideo}
            </a>
            <a
              href="#workflow"
              className="inline-flex min-h-[52px] items-center rounded-xl border border-[color:var(--mf-line-2)] px-6 font-semibold text-[color:var(--mf-heading)] transition-colors hover:border-[color:var(--mf-hover-line)] sm:text-[17px]"
            >
              {h.ctaHow}
            </a>
          </div>
          <dl className="mf-u mf-d5 mt-2 grid grid-cols-3 gap-4 border-t border-[color:var(--mf-line)] pt-5">
            {h.facts.map((f) => (
              <div key={f.label}>
                <dt className="mf-kufi text-[30px] font-semibold leading-tight text-[color:var(--mf-heading)] sm:text-[34px]">{f.value}</dt>
                <dd className="m-0 text-[13px] leading-snug text-[color:var(--mf-muted)] sm:text-sm">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Fenêtre en arche */}
        <div className="mf-rise mf-d2 relative mx-auto aspect-[460/580] w-full max-w-[400px] sm:max-w-[460px]">
          <svg
            aria-hidden="true"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)] overflow-visible"
          >
            <path
              className="mf-draw"
              pathLength={1}
              d={ARCH_PATH}
              fill="none"
              stroke={BRONZE}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mf-arch absolute inset-0 overflow-hidden bg-[#173D35]">
            <Zellige id="mf-z-hero" />
            <div
              role="img"
              aria-label={h.mock.ariaLabel}
              className="absolute inset-x-[7%] bottom-[7%] flex flex-col gap-3 rounded-[14px] bg-[var(--mf-surface)] p-3.5 text-[12px] leading-normal shadow-[0_30px_50px_-24px_rgba(0,0,0,0.55)] sm:p-[18px] sm:text-[13px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-[color:var(--mf-subtle)]">{h.mock.date}</div>
                  <div className="mf-kufi text-[16px] font-semibold text-[color:var(--mf-heading)] sm:text-[18px]">{h.mock.title}</div>
                </div>
                <span className="whitespace-nowrap rounded-lg bg-[var(--mf-tint-green)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--mf-heading)] sm:text-[12px]">
                  {h.mock.newCase}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {h.mock.kpis.map((k) => (
                  <div
                    key={k.label}
                    className={cn(
                      'rounded-[10px] border px-2 py-1.5 sm:px-2.5 sm:py-2',
                      k.pending ? 'border-[color:var(--mf-bronze-soft)] bg-[var(--mf-tint-bronze-2)]' : 'border-[color:var(--mf-line)]',
                    )}
                  >
                    <div className={cn('truncate text-[10px] sm:text-[11px]', k.pending ? 'text-[color:var(--mf-bronze-text)]' : 'text-[color:var(--mf-subtle)]')}>
                      {k.label}
                    </div>
                    <div className={cn('mf-kufi text-[20px] font-semibold sm:text-[22px]', k.pending && 'text-[color:var(--mf-bronze-text)]')}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[color:var(--mf-line)]">
                {h.mock.rows.map((r, i) => (
                  <div
                    key={r.label}
                    className={cn('flex items-center justify-between gap-2 py-2', i === 0 && 'border-b border-[color:var(--mf-line)]')}
                  >
                    <span className="min-w-0 truncate">{r.label}</span>
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap rounded-md px-2 text-[11px] sm:text-[12px]',
                        r.pending ? 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]' : 'bg-[var(--mf-tint-green)] text-[color:var(--mf-green-text)]',
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sceau « approuvé » */}
          <div
            aria-hidden="true"
            className="mf-seal absolute -end-3 top-[30%] flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-[#A67C45] bg-[var(--mf-bg)] text-[color:var(--mf-bronze-text)] shadow-[0_0_0_6px_var(--mf-bg),0_0_0_7px_rgba(166,124,69,0.45),0_18px_30px_-16px_rgba(0,0,0,0.4)] sm:-end-6 sm:h-[116px] sm:w-[116px]"
          >
            <Check className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
            <span className="mf-kufi text-[14px] font-bold leading-tight sm:text-[17px]">{h.seal}</span>
            <span className="text-[10px]">{h.sealSub}</span>
          </div>
        </div>
      </div>
      <Frieze id="mf-frieze-1" />
    </section>
  )
}

/* --------------------------------- Rôles --------------------------------- */

export function RolesSection({ copy }: { copy: LandingCopy }) {
  const borders = ['border-[color:var(--mf-line-strong)]', 'border-[color:var(--mf-line-green)]', 'border-[#A67C45]']
  return (
    <section aria-labelledby="mf-roles" className="border-b border-[color:var(--mf-line)] bg-[var(--mf-surface)]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-[72px]">
        <h2 id="mf-roles" className="mf-rv mf-kufi mf-pre m-0 text-[28px] font-semibold leading-[1.35] text-[color:var(--mf-heading)] sm:text-[30px]">
          {copy.roles.title}
        </h2>
        {copy.roles.items.map((r, i) => (
          <div key={r.title} className={cn('mf-rv border-s-2 ps-5', borders[i])}>
            <div className="mf-kufi text-[21px] font-semibold text-[color:var(--mf-heading)]">{r.title}</div>
            <div className="mb-1.5 text-[13px] font-semibold text-[color:var(--mf-bronze-text)]">{r.badge}</div>
            <p className="m-0 text-base text-[color:var(--mf-muted)]">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------- Fonctionnalités ---------------------------- */

export function FeaturesSection({ copy }: { copy: LandingCopy }) {
  const f = copy.features
  return (
    <section id="features" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid items-start gap-12 lg:grid-cols-3 lg:gap-16">
        <div className="mf-rv flex flex-col gap-4 lg:sticky lg:top-28">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <H2>{f.title}</H2>
          <p className="m-0 text-[color:var(--mf-muted)]">{f.lead}</p>
          <p className="mf-amiri m-0 mt-2 border-s-2 border-[#A67C45] ps-4 text-[22px] italic leading-relaxed text-[color:var(--mf-bronze-text)] rtl:not-italic">
            {f.quote}
          </p>
        </div>
        <ol className="m-0 grid list-none gap-x-12 p-0 md:grid-cols-2 lg:col-span-2">
          {f.items.map((item, i) => (
            <li key={item.title} className="mf-rv flex gap-5 border-t border-[color:var(--mf-line)] py-7">
              <span className="mf-kufi min-w-[36px] text-[28px] leading-tight text-[#A67C45]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="m-0 mb-1.5 text-[19px] font-semibold text-[color:var(--mf-text)]">{item.title}</h3>
                <p className="m-0 text-base text-[color:var(--mf-muted)]">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------- Processus ------------------------------- */

export function WorkflowSection({ copy }: { copy: LandingCopy }) {
  const w = copy.workflow
  const last = w.steps.length - 1
  return (
    <section id="workflow" className="scroll-mt-24 bg-[#173D35] text-[#EDF2EF]">
      <Frieze id="mf-frieze-2" dark />
      <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
        <div className="mf-rv mb-14 flex max-w-[660px] flex-col gap-3.5 lg:mb-[72px]">
          <Eyebrow light>{w.eyebrow}</Eyebrow>
          <H2 light>{w.title}</H2>
          <p className="m-0 text-[#BFD0C8]">{w.lead}</p>
        </div>
        <div className="relative">
          <div aria-hidden="true" className="mf-line absolute inset-x-[22px] top-[21px] hidden h-px bg-[#C9A36A] opacity-60 lg:block" />
          <ol className="relative m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-7">
            {w.steps.map((s, i) => {
              const ai = i === last - 1
              const final = i === last
              return (
                <li key={s.title} className="mf-rv flex flex-col gap-3">
                  <StarStep n={i + 1} variant={ai ? 'bronze' : final ? 'ivory' : 'outline'} />
                  <span
                    className={cn(
                      'self-start rounded-full px-2.5 text-[12px]',
                      ai
                        ? 'bg-[#e2c691] font-semibold text-[#14201c]'
                        : final
                          ? 'bg-[#f7f4ec] font-semibold text-[#173d35]'
                          : 'border border-white/20 text-[#CFE0D8]',
                    )}
                  >
                    {s.role}
                  </span>
                  <h3 className="mf-kufi m-0 text-[20px] font-semibold text-white">{s.title}</h3>
                  <p className="m-0 text-[15px] text-[#BFD0C8]">{s.text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Vidéo ---------------------------------- */

export function VideoSection({ copy }: { copy: LandingCopy }) {
  const v = copy.video
  return (
    <section id="video" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pt-20 sm:px-6 lg:pt-28">
      <div className="mf-rv mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[620px] flex-col gap-3.5">
          <Eyebrow>{v.eyebrow}</Eyebrow>
          <H2>{v.title}</H2>
        </div>
        <p className="m-0 max-w-[420px] text-[color:var(--mf-muted)]">{v.lead}</p>
      </div>
      <div className="mf-rv rounded-[26px] border border-[color:var(--mf-line)] bg-[var(--mf-surface)] p-2.5 sm:p-3.5">
        {DEMO_VIDEO_URL ? (
          <video
            src={DEMO_VIDEO_URL}
            controls
            preload="metadata"
            className="aspect-video w-full rounded-2xl bg-[#173D35]"
            aria-label={v.label}
          />
        ) : (
          <div
            role="img"
            aria-label={v.label}
            className="relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#173D35] p-6 text-center text-[#F7F4EC] sm:gap-[18px]"
          >
            <Zellige id="mf-z-video" opacity={0.12} />
            <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f4ec] text-[#173d35] shadow-[0_0_0_10px_rgba(247,244,236,0.15),0_0_0_11px_rgba(201,163,106,0.5)] sm:h-24 sm:w-24">
              <Play aria-hidden="true" className="h-7 w-7 fill-current sm:h-9 sm:w-9" />
            </span>
            <div className="mf-kufi relative text-[18px] font-semibold sm:text-[22px]">{v.label}</div>
            <div className="relative rounded-lg border border-dashed border-[#C9A36A]/70 px-3.5 py-1 text-[13px] text-[#BFD0C8] sm:text-sm">
              {v.placeholder}
            </div>
            <div className="absolute inset-x-5 bottom-4 hidden justify-between text-[13px] text-[#BFD0C8] sm:flex">
              <span>{v.caption}</span>
            </div>
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
    <section id="documents" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mf-rv mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <Eyebrow>{d.eyebrow}</Eyebrow>
          <H2>{d.title}</H2>
        </div>
        <p className="m-0 max-w-[420px] text-[color:var(--mf-muted)]">{d.lead}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {d.items.map((doc, i) => {
          const notif = doc.family === 'notification'
          return (
            <article
              key={doc.title}
              className={cn(
                'mf-rv flex flex-col gap-2 rounded-b-[14px] rounded-t border border-t-[3px] border-[color:var(--mf-line)] bg-[var(--mf-surface)] p-6 transition duration-200 hover:-translate-y-[3px] hover:border-[#A67C45]',
                notif ? 'border-t-[color:var(--mf-line-strong)]' : 'border-t-[#A67C45]',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-2.5 text-[12px] font-semibold',
                    notif ? 'bg-[var(--mf-tint-green)] text-[color:var(--mf-green-text)]' : 'bg-[var(--mf-tint-bronze)] text-[color:var(--mf-bronze-text)]',
                  )}
                >
                  {doc.tag}
                </span>
                <span className="mf-kufi text-[color:var(--mf-faint)]">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mf-kufi m-0 mt-1 text-[21px] font-semibold text-[color:var(--mf-heading)]">{doc.title}</h3>
              <p className="m-0 text-[15px] text-[color:var(--mf-muted)]">{doc.text}</p>
            </article>
          )
        })}
        <a
          href="#video"
          className="mf-rv relative flex flex-col justify-between gap-4 overflow-hidden rounded-b-[14px] rounded-t bg-[#173D35] p-6 text-[#F7F4EC]"
        >
          <svg aria-hidden="true" width="150" height="150" viewBox="0 0 64 64" className="absolute -bottom-8 -end-8 opacity-40">
            <g fill="none" stroke={BRONZE_LIGHT} strokeWidth="1">
              <rect x="16" y="16" width="32" height="32" />
              <rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)" />
              <circle cx="32" cy="32" r="8" />
            </g>
          </svg>
          <span className="mf-kufi relative text-[22px] font-semibold leading-snug">{d.ctaTitle}</span>
          <span className="relative inline-flex items-center gap-2 font-semibold text-[#E2C691]">
            {d.cta}
            <Arrow />
          </span>
        </a>
      </div>
    </section>
  )
}

/* ------------------------------ Assistant IA ----------------------------- */

export function AiSection({ copy }: { copy: LandingCopy }) {
  const a = copy.ai
  const bar = (w: string, tone = 'bg-[var(--mf-bar)]') => <div className={cn('h-2 rounded', tone)} style={{ width: w }} />
  return (
    <section id="ai" className="scroll-mt-24 border-y border-[color:var(--mf-line)] bg-[var(--mf-surface)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-[72px] lg:py-28">
        <div className="mf-rv flex flex-col gap-5">
          <Eyebrow>{a.eyebrow}</Eyebrow>
          <H2>{a.title}</H2>
          <p className="m-0 text-[color:var(--mf-muted)]">{a.lead}</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {a.points.map((p, i) => (
              <li key={p.strong} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn('mt-2.5 h-2.5 w-2.5 shrink-0 rotate-45', i === a.points.length - 1 ? 'bg-[#A67C45]' : 'bg-[#173D35]')}
                />
                <span>
                  <b className="font-semibold">{p.strong}</b> {p.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-1 border-t border-[color:var(--mf-line)] pt-3.5 text-sm text-[color:var(--mf-muted)]">{a.disclaimer}</p>
        </div>

        <div role="img" aria-label={a.doc.ariaLabel} className="mf-rv flex flex-wrap items-start gap-4">
          <div className="relative flex min-w-0 flex-[1_1_300px] flex-col gap-3 rounded-md border border-[color:var(--mf-line)] bg-[var(--mf-paper)] px-6 py-8 shadow-[0_30px_60px_-36px_rgba(20,32,28,0.35)] sm:px-8 sm:py-9">
            <div aria-hidden="true" className="pointer-events-none absolute inset-2.5 rounded-sm border border-[color:var(--mf-bronze-soft)]" />
            <div className="flex justify-between gap-2 text-[12px] text-[color:var(--mf-subtle)]">
              <span>{a.doc.caseRef}</span>
              <span className="rounded-md bg-[var(--mf-tint-bronze)] px-2.5 font-semibold text-[color:var(--mf-bronze-text)]">{a.doc.badge}</span>
            </div>
            <div className="mf-amiri border-b border-[color:var(--mf-line)] pb-2.5 pt-1 text-center text-[24px] font-bold text-[color:var(--mf-text-strong)] sm:text-[26px]">
              {a.doc.title}
            </div>
            {bar('94%')}
            {bar('82%')}
            {bar('88%')}
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-[#C9A36A] bg-[var(--mf-tint-bronze-3)] p-3">
              <div className="text-[12px] font-semibold text-[color:var(--mf-bronze-text)]">{a.doc.source}</div>
              {bar('96%', 'bg-[var(--mf-bronze-soft)]')}
              {bar('74%', 'bg-[var(--mf-bronze-soft)]')}
            </div>
            {bar('90%')}
            {bar('58%')}
            <div className="flex justify-end pt-3.5">
              <div className="w-40 border-t border-[color:var(--mf-faint)] pt-1.5 text-center text-[12px] text-[color:var(--mf-subtle)]">{a.doc.signature}</div>
            </div>
          </div>
          <div className="flex flex-[1_1_200px] flex-col gap-3 rounded-[14px] border border-[color:var(--mf-line)] bg-[var(--mf-bg)] p-5 text-sm sm:flex-[0_1_220px]">
            <div className="mf-kufi text-[18px] font-semibold text-[color:var(--mf-heading)]">{a.review.title}</div>
            {a.review.checks.map((c) => (
              <div key={c} className="flex items-center gap-2 text-[color:var(--mf-green-text)]">
                <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
                {c}
              </div>
            ))}
            <div className="flex items-center gap-2 text-[color:var(--mf-bronze-text)]">
              <Circle aria-hidden="true" className="h-4 w-4" />
              {a.review.pending}
            </div>
            <span className="rounded-lg bg-[#173D35] p-2.5 text-center font-semibold text-white">{a.review.approve}</span>
            <span className="rounded-lg border border-[color:var(--mf-line-2)] p-2.5 text-center font-semibold text-[color:var(--mf-heading)]">{a.review.changes}</span>
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
      <H2 className="mf-rv mb-12 max-w-[660px] !text-[28px] sm:!text-[34px] lg:!text-[38px]">{copy.trust.title}</H2>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-[color:var(--mf-line)] bg-[var(--mf-line)] sm:grid-cols-2 lg:grid-cols-4">
        {copy.trust.items.map((t, i) => {
          const Icon = icons[i]
          return (
            <div key={t.title} className="mf-rv flex flex-col gap-2.5 bg-[var(--mf-surface)] p-7">
              <Icon aria-hidden="true" className="h-7 w-7 text-[color:var(--mf-heading)]" strokeWidth={1.6} />
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
    <section id="faq" className="mx-auto max-w-[900px] scroll-mt-24 px-4 pb-20 sm:px-6 lg:pb-28">
      <H2 className="mf-rv mb-8 text-center !text-[28px] sm:!text-[34px] lg:!text-[38px]">{copy.faq.title}</H2>
      <div className="border-t border-[color:var(--mf-line)]">
        {copy.faq.items.map((item, i) => (
          <details key={item.q} open={i === 0} className="group border-b border-[color:var(--mf-line)] py-4">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold sm:text-[19px] [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus aria-hidden="true" className="h-5 w-5 shrink-0 text-[#A67C45] transition-transform group-open:rotate-45" />
            </summary>
            <p className="m-0 mt-2 text-[color:var(--mf-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------- Contact -------------------------------- */

const inputCls =
  'min-h-[46px] w-full rounded-[10px] border border-[color:var(--mf-line-2)] bg-[var(--mf-input)] px-3.5 py-2.5 font-normal text-[color:var(--mf-text)] focus:border-[color:var(--mf-hover-line)]'

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
    <section id="contact" className="scroll-mt-24 px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-[#173D35]">
        <svg
          aria-hidden="true"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className="absolute end-[4%] top-[12%] hidden h-[380px] w-[300px] opacity-35 lg:block"
        >
          <path d={ARCH_PATH} fill="none" stroke={BRONZE_LIGHT} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-[72px]">
          <div className="mf-rv flex flex-col gap-4 text-[#EDF2EF]">
            <Eyebrow light>{c.eyebrow}</Eyebrow>
            <H2 light>{c.title}</H2>
            <p className="m-0 text-[#BFD0C8]">{c.lead}</p>
            {(CONTACT_EMAIL || CONTACT_PHONE) && (
              <div className="flex flex-col gap-1.5 text-[15px] text-[#DCE7E1]">
                {CONTACT_EMAIL && (
                  <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="text-[#DCE7E1] hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                )}
                {CONTACT_PHONE && (
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} dir="ltr" className="text-[#DCE7E1] hover:text-white">
                    {CONTACT_PHONE}
                  </a>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="mf-rv grid gap-4 rounded-[18px] bg-[var(--mf-surface)] p-5 text-[color:var(--mf-text)] sm:grid-cols-2 sm:p-8">
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
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mf-btn)] p-3.5 text-[17px] font-semibold text-white transition-colors hover:bg-[var(--mf-btn-hover)] sm:col-span-2"
            >
              {c.submit}
              <Arrow className="h-[18px] w-[18px] text-[#E2C691]" />
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
  const linkCls = 'text-[#CFDDD6] hover:text-white'
  return (
    <footer className="bg-[var(--mf-deep)] text-[#CFDDD6]">
      <Frieze id="mf-frieze-3" dark />
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-7 pt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <BrandMark lang={lang} light />
          <p className="m-0 max-w-[380px] text-[15px]">{f.tagline}</p>
        </div>
        <nav aria-label={f.platform} className="flex flex-col gap-2 text-[15px]">
          <div className="text-sm font-semibold text-[#E2C691]">{f.platform}</div>
          <a href="#features" className={linkCls}>{copy.nav.features}</a>
          <a href="#workflow" className={linkCls}>{copy.nav.workflow}</a>
          <a href="#documents" className={linkCls}>{copy.nav.documents}</a>
        </nav>
        <nav aria-label={f.contact} className="flex flex-col gap-2 text-[15px]">
          <div className="text-sm font-semibold text-[#E2C691]">{f.contact}</div>
          <a href="#video" className={linkCls}>{copy.video.eyebrow}</a>
          <a href="#contact" className={linkCls}>{copy.contactCta}</a>
          <Link to="/login" className={linkCls}>{copy.login}</Link>
          <a href="#faq" className={linkCls}>{copy.nav.faq}</a>
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-white/10 px-4 pb-9 pt-5 text-[13px] sm:px-6">
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
