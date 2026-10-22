import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UserCheck } from 'lucide-react'
import { api, type MissionResponse } from '../../api/client'
import { presenceSchema, type PresenceValues } from '../../lib/validators'
import { apiErrorKey } from '../../lib/format'
import { useToast } from '../Toast'
import { Button, Card, Field, Input } from '../ui'

/* =============================================================================
 * PresenceCard — personne présente lors du constat :
 * « بحضور وتحت عهدة ومسؤولية السيدة … بصفتها … ».
 * Le collaborateur la renseigne pendant la mission (IN_PROGRESS).
 * ========================================================================== */

export function PresenceCard({
  mission,
  canEdit,
}: {
  mission: MissionResponse
  canEdit: boolean
}) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PresenceValues>({
    resolver: zodResolver(presenceSchema),
    defaultValues: { presentPersonName: '', presentPersonCapacity: '' },
  })

  useEffect(() => {
    reset({
      presentPersonName: mission.presentPersonName ?? '',
      presentPersonCapacity: mission.presentPersonCapacity ?? '',
    })
  }, [mission.presentPersonName, mission.presentPersonCapacity, reset])

  const saveM = useMutation({
    mutationFn: (values: PresenceValues) =>
      api.missions.updatePresence(mission.id, {
        presentPersonName: values.presentPersonName.trim(),
        presentPersonCapacity: values.presentPersonCapacity.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] })
      toast(t('presence.saved'))
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  return (
    <Card className="p-5">
      <div className="flex items-start gap-2.5">
        <UserCheck className="mt-0.5 h-4 w-4 text-ink-soft" />
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('presence.title')}</h2>
          <p className="text-xs text-ink-muted" dir="rtl">
            {t('presence.hint')}
          </p>
        </div>
      </div>

      {canEdit ? (
        <form
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={handleSubmit((v) => saveM.mutate(v))}
          noValidate
        >
          <Field
            label={t('presence.name')}
            required
            error={errors.presentPersonName ? t(errors.presentPersonName.message as string) : undefined}
          >
            <Input {...register('presentPersonName')} dir="auto" />
          </Field>
          <Field
            label={t('presence.capacity')}
            required
            error={
              errors.presentPersonCapacity
                ? t(errors.presentPersonCapacity.message as string)
                : undefined
            }
          >
            <Input
              {...register('presentPersonCapacity')}
              dir="auto"
              placeholder={t('presence.capacityPlaceholder')}
            />
          </Field>
          <Button type="submit" loading={saveM.isPending} disabled={!isDirty}>
            {t('presence.save')}
          </Button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-ink" dir="auto">
          {mission.presentPersonName
            ? `${mission.presentPersonName} — ${mission.presentPersonCapacity ?? ''}`
            : t('presence.none')}
        </p>
      )}
    </Card>
  )
}
