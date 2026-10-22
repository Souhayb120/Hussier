import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Building2, Pencil, Plus, Trash2, UserRound, Users } from 'lucide-react'
import { api, type PartyPayload, type PartyResponse } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import { partySchema, type PartyValues } from '../../lib/validators'
import { apiErrorKey } from '../../lib/format'
import { useToast } from '../Toast'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dialog,
  EmptyState,
  Field,
  Input,
  Select,
  Skeleton,
} from '../ui'

/* =============================================================================
 * PartiesPanel — parties citées dans le procès-verbal (طالب الإجراء، المطلوب ضده…).
 * Le requérant et le destinataire sont repris par l'IA dans l'en-tête du PV.
 * ========================================================================== */

const EMPTY: PartyValues = {
  role: 'REQUESTER',
  type: 'PERSON',
  fullName: '',
  cin: '',
  rc: '',
  legalRepresentative: '',
  address: '',
  phone: '',
  capacity: '',
}

/** Chaîne vide → undefined (le back-end garde la valeur nulle). */
const clean = (value?: string) => value?.trim() || undefined

export function PartiesPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const { can } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const canManage = can('cases:edit')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PartyResponse | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PartyResponse | null>(null)

  const listQ = useQuery({
    queryKey: ['parties', caseId],
    queryFn: () => api.parties.listByCase(caseId),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => api.parties.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', caseId] })
      toast(t('parties.deleted'))
      setPendingDelete(null)
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (party: PartyResponse) => {
    setEditing(party)
    setFormOpen(true)
  }

  const items = listQ.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{t('parties.title')}</h2>
          <p className="text-sm text-ink-muted">{t('parties.subtitle')}</p>
        </div>
        {canManage && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            {t('parties.add')}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {listQ.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : listQ.isError ? (
          <EmptyState
            title={t('errors.loadFailed')}
            description={t('errors.network')}
            action={
              <Button variant="outline" onClick={() => listQ.refetch()}>
                {t('common.retry')}
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={t('parties.empty')}
            description={t('parties.emptyHint')}
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((party) => (
              <li
                key={party.id}
                className="flex flex-wrap items-start justify-between gap-3 p-5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    {party.type === 'COMPANY' ? (
                      <Building2 className="h-4 w-4" />
                    ) : (
                      <UserRound className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink" dir="auto">
                        {party.fullName}
                      </p>
                      <Badge tone={party.role === 'TARGET' ? 'gold' : 'brand'}>
                        {t(`partyRole.${party.role}`)}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                      <span>{t(`partyType.${party.type}`)}</span>
                      {party.cin && (
                        <span>
                          {t('parties.cin')} : {party.cin}
                        </span>
                      )}
                      {party.rc && (
                        <span>
                          {t('parties.rc')} : {party.rc}
                        </span>
                      )}
                      {party.legalRepresentative && (
                        <span dir="auto">{party.legalRepresentative}</span>
                      )}
                      {party.capacity && <span dir="auto">{party.capacity}</span>}
                    </p>
                    {party.address && (
                      <p className="mt-0.5 text-sm text-ink-muted" dir="auto">
                        {party.address}
                      </p>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Pencil className="h-4 w-4" />}
                      onClick={() => openEdit(party)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setPendingDelete(party)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <PartyFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        caseId={caseId}
        party={editing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteM.mutate(pendingDelete.id)}
        title={t('parties.confirmDeleteTitle')}
        message={t('parties.confirmDelete', { name: pendingDelete?.fullName ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteM.isPending}
      />
    </div>
  )
}

/* ------------------------------ Formulaire ------------------------------- */

function PartyFormDialog({
  open,
  onClose,
  caseId,
  party,
}: {
  open: boolean
  onClose: () => void
  caseId: string
  party: PartyResponse | null
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const editing = Boolean(party)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartyValues>({ resolver: zodResolver(partySchema), defaultValues: EMPTY })

  const type = watch('type')

  useEffect(() => {
    if (!open) return
    reset(
      party
        ? {
            role: party.role,
            type: party.type,
            fullName: party.fullName,
            cin: party.cin ?? '',
            rc: party.rc ?? '',
            legalRepresentative: party.legalRepresentative ?? '',
            address: party.address ?? '',
            phone: party.phone ?? '',
            capacity: party.capacity ?? '',
          }
        : EMPTY,
    )
  }, [open, party, reset])

  const mutation = useMutation({
    mutationFn: (values: PartyValues) => {
      const payload: PartyPayload = {
        role: values.role,
        type: values.type,
        fullName: values.fullName.trim(),
        cin: clean(values.cin),
        rc: clean(values.rc),
        legalRepresentative: clean(values.legalRepresentative),
        address: clean(values.address),
        phone: clean(values.phone),
        capacity: clean(values.capacity),
      }
      return party ? api.parties.update(party.id, payload) : api.parties.create(caseId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties', caseId] })
      toast(editing ? t('parties.updated') : t('parties.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const err = (key: keyof PartyValues) =>
    errors[key] ? t(errors[key]?.message as string) : undefined

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('parties.editTitle') : t('parties.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="party-form" loading={mutation.isPending}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="party-form"
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('parties.role')} required error={err('role')}>
            <Select {...register('role')}>
              <option value="REQUESTER">{t('partyRole.REQUESTER')}</option>
              <option value="TARGET">{t('partyRole.TARGET')}</option>
              <option value="OTHER">{t('partyRole.OTHER')}</option>
            </Select>
          </Field>
          <Field label={t('parties.type')} required error={err('type')}>
            <Select {...register('type')}>
              <option value="PERSON">{t('partyType.PERSON')}</option>
              <option value="COMPANY">{t('partyType.COMPANY')}</option>
            </Select>
          </Field>
        </div>

        <Field label={t('parties.fullName')} required error={err('fullName')}>
          <Input {...register('fullName')} dir="auto" />
        </Field>

        {type === 'COMPANY' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('parties.rc')} error={err('rc')}>
              <Input {...register('rc')} dir="ltr" />
            </Field>
            <Field label={t('parties.legalRepresentative')} error={err('legalRepresentative')}>
              <Input
                {...register('legalRepresentative')}
                dir="auto"
                placeholder={t('parties.legalRepresentativePlaceholder')}
              />
            </Field>
          </div>
        ) : (
          <Field label={t('parties.cin')} error={err('cin')}>
            <Input {...register('cin')} dir="ltr" placeholder="D643116" />
          </Field>
        )}

        <Field label={t('parties.address')} error={err('address')}>
          <Input {...register('address')} dir="auto" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('parties.phone')} error={err('phone')}>
            <Input {...register('phone')} inputMode="tel" dir="ltr" />
          </Field>
          <Field label={t('parties.capacity')} error={err('capacity')}>
            <Input
              {...register('capacity')}
              dir="auto"
              placeholder={t('parties.capacityPlaceholder')}
            />
          </Field>
        </div>
      </form>
    </Dialog>
  )
}
