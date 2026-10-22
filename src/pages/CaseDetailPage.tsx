import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  Hash,
  MapPin,
  Paperclip,
  Pencil,
  Phone,
  ScanSearch,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../components/Toast'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DeadlineIndicator,
  EmptyState,
  Skeleton,
  StatusBadge,
  Tabs,
  type TabItem,
} from '../components/ui'
import { AttachmentsPanel } from '../components/domain/AttachmentsPanel'
import { BillingPanel } from '../components/domain/BillingPanel'
import { CaseFormDialog } from '../components/domain/CaseFormDialog'
import { ClientTrackingPanel } from '../components/domain/ClientTrackingPanel'
import { DocumentsPanel } from '../components/domain/DocumentsPanel'
import { PartiesPanel } from '../components/domain/PartiesPanel'
import { apiErrorKey, useFormatters } from '../lib/format'

export default function CaseDetailPage() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const canDelete = can('cases:delete')
  const canSeeMissions = can('missions:view')
  const canSeeBilling = can('billing:manage')
  const canSeeTracking = can('tracking:manage')

  // Onglet piloté par l'URL (?tab=parties|documents|attachments|missions|billing|tracking) — partageable et stable au rechargement.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab =
    tabParam === 'parties' ||
    tabParam === 'documents' ||
    tabParam === 'attachments' ||
    (tabParam === 'missions' && canSeeMissions) ||
    (tabParam === 'billing' && canSeeBilling) ||
    (tabParam === 'tracking' && canSeeTracking)
      ? tabParam
      : 'summary'
  const changeTab = (next: string) => {
    if (next === 'summary') setSearchParams({}, { replace: true })
    else setSearchParams({ tab: next }, { replace: true })
  }

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const caseQ = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.cases.get(id),
    enabled: Boolean(id),
  })

  const deleteM = useMutation({
    mutationFn: () => api.cases.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast(t('cases.deleted'))
      navigate('/dossiers')
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const tabs = useMemo(() => {
    const items: TabItem[] = [
      { id: 'summary', label: t('cases.tabSummary') },
      { id: 'parties', label: t('cases.tabParties'), icon: <Users className="h-4 w-4" /> },
    ]
    if (canSeeMissions) {
      items.push({
        id: 'missions',
        label: t('cases.tabMissions'),
        icon: <ClipboardList className="h-4 w-4" />,
      })
    }
    items.push({
      id: 'documents',
      label: t('cases.tabDocuments'),
      icon: <FileText className="h-4 w-4" />,
    })
    items.push({
      id: 'attachments',
      label: t('cases.tabAttachments'),
      icon: <Paperclip className="h-4 w-4" />,
    })
    if (canSeeBilling) {
      items.push({ id: 'billing', label: t('cases.tabBilling'), icon: <Wallet className="h-4 w-4" /> })
    }
    if (canSeeTracking) {
      items.push({
        id: 'tracking',
        label: t('cases.tabTracking'),
        icon: <ScanSearch className="h-4 w-4" />,
      })
    }
    return items
  }, [t, canSeeMissions, canSeeBilling, canSeeTracking])

  if (caseQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (caseQ.isError || !caseQ.data) {
    return (
      <EmptyState
        title={t('cases.notFound')}
        action={
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4 rtl:rotate-180" />} onClick={() => navigate('/dossiers')}>
            {t('common.back')}
          </Button>
        }
      />
    )
  }

  const item = caseQ.data

  return (
    <div className="space-y-5">
      <Link
        to="/dossiers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('cases.title')}
      </Link>

      {/* En-tête */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={item.caseStatus} label={t(`caseStatus.${item.caseStatus}`)} />
              <Badge tone="neutral">
                <Hash className="h-3 w-3" />
                {item.ref}
              </Badge>
              <DeadlineIndicator deadline={item.deadline} closed={item.caseStatus === 'CLOSED'} />
            </div>
            <h1 className="mt-2 text-22 font-bold tracking-tight text-ink sm:text-28">
              {item.clientName}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">{item.subject}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditOpen(true)}
            >
              {t('common.edit')}
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setConfirmDelete(true)}
              >
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs items={tabs} value={tab} onChange={changeTab} />

      {tab === 'summary' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">{t('cases.caseInfo')}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow icon={<FileText />} label={t('cases.subject')} value={item.subject} />
              <InfoRow
                icon={<CalendarClock />}
                label={t('cases.deadline')}
                value={fmt.date(item.deadline)}
              />
              <InfoRow
                icon={<Hash />}
                label={`${t('cases.ref')} — ${t('cases.refHint')}`}
                value={item.ref}
              />
              <InfoRow
                icon={<UserRound />}
                label={t('cases.createdBy')}
                value={item.createdByUsername ?? '—'}
              />
            </dl>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {t('cases.description')}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {item.description || t('common.none')}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">{t('cases.clientInfo')}</h2>
            <dl className="mt-4 space-y-4">
              <InfoRow icon={<UserRound />} label={t('cases.client')} value={item.clientName} />
              <InfoRow icon={<Hash />} label={t('cases.ice')} value={item.clientIce || '—'} />
              <InfoRow icon={<MapPin />} label={t('cases.address')} value={item.address} />
              <InfoRow icon={<Phone />} label={t('cases.phone')} value={item.phone || '—'} />
              <InfoRow
                icon={<CalendarClock />}
                label={t('common.createdAt')}
                value={fmt.date(item.createdAt)}
              />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'parties' && <PartiesPanel caseId={item.id} />}

      {tab === 'documents' && <DocumentsPanel caseId={item.id} />}

      {tab === 'attachments' && <AttachmentsPanel caseId={item.id} />}

      {tab === 'missions' && canSeeMissions && <CaseMissionsTab caseId={item.id} />}

      {tab === 'billing' && canSeeBilling && <BillingPanel caseId={item.id} />}

      {tab === 'tracking' && canSeeTracking && <ClientTrackingPanel caseId={item.id} />}

      <CaseFormDialog open={editOpen} onClose={() => setEditOpen(false)} caseItem={item} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteM.mutate()}
        title={t('cases.confirmDeleteTitle')}
        message={t('cases.confirmDelete', { ref: item.ref })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-ink-soft [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div className="min-w-0">
        <dt className="text-2xs font-medium uppercase tracking-wide text-ink-soft">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-ink">{value}</dd>
      </div>
    </div>
  )
}

function CaseMissionsTab({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()

  const query = useQuery({
    queryKey: ['missions', 'by-case', caseId],
    queryFn: () => api.missions.list(0, 100),
  })

  const missions = (query.data?.content ?? []).filter((m) => m.caseId === caseId)

  if (query.isLoading) {
    return (
      <Card className="space-y-3 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </Card>
    )
  }

  if (missions.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Building2 className="h-6 w-6" />} title={t('cases.noMissions')} />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-line">
        {missions.map((mission) => (
          <li key={mission.id}>
            <Link
              to={`/missions/${mission.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-canvas/60"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{mission.title}</p>
                <p className="truncate text-xs text-ink-muted">
                  {t('missions.assignedTo')}: {mission.assignedToUsername}
                  {mission.scheduledAt ? ` · ${fmt.dateTime(mission.scheduledAt)}` : ''}
                </p>
              </div>
              <StatusBadge value={mission.status} label={t(`missionStatus.${mission.status}`)} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
