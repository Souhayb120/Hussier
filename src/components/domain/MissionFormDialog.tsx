import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../../api/client'
import { missionSchema, type MissionValues } from '../../lib/validators'
import { Button, Dialog, Field, Input, Select, Textarea } from '../ui'
import { useToast } from '../Toast'
import { apiErrorKey } from '../../lib/format'

const EMPTY: MissionValues = {
  caseId: '',
  collaborateurId: '',
  title: '',
  description: '',
  scheduledAt: '',
}

/** `caseId` donné (depuis la page du dossier) : le dossier est déjà choisi, la liste est masquée. */
export function MissionFormDialog({
  open,
  onClose,
  caseId,
}: {
  open: boolean
  onClose: () => void
  caseId?: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MissionValues>({ resolver: zodResolver(missionSchema), defaultValues: EMPTY })

  const casesQ = useQuery({
    queryKey: ['cases', { page: 0, size: 100 }],
    queryFn: () => api.cases.list(0, 100),
    enabled: open && !caseId,
  })
  const usersQ = useQuery({
    queryKey: ['users', { page: 0, size: 100 }],
    queryFn: () => api.users.list(0, 100),
    enabled: open,
  })

  useEffect(() => {
    if (open) reset({ ...EMPTY, caseId: caseId ?? '' })
  }, [open, caseId, reset])

  const collaborators = (usersQ.data?.content ?? []).filter((u) => u.role === 'COLLABORATEUR')
  // un dossier clôturé n'a plus besoin de mission
  const openCases = (casesQ.data?.content ?? []).filter((c) => c.caseStatus !== 'CLOSED')

  const mutation = useMutation({
    mutationFn: (values: MissionValues) =>
      api.missions.create({
        caseId: values.caseId,
        collaborateurId: values.collaborateurId,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        scheduledAt: values.scheduledAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      if (caseId) queryClient.invalidateQueries({ queryKey: ['case', caseId] })
      toast(t('missions.created'))
      onClose()
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const noCollaborators = usersQ.isSuccess && collaborators.length === 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('missions.newTitle')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="mission-form" loading={mutation.isPending} disabled={noCollaborators}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <form
        id="mission-form"
        className="space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        {!caseId && (
          <Field
            label={t('missions.case')}
            required
            error={errors.caseId ? t(errors.caseId.message as string) : undefined}
          >
            <Select {...register('caseId')} defaultValue="">
              <option value="" disabled>
                {t('missions.selectCase')}
              </option>
              {openCases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ref} — {item.clientName}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          label={t('missions.assignedTo')}
          required
          hint={noCollaborators ? t('missions.noCollaborators') : undefined}
          error={errors.collaborateurId ? t(errors.collaborateurId.message as string) : undefined}
        >
          <Select {...register('collaborateurId')} defaultValue="" disabled={noCollaborators}>
            <option value="" disabled>
              {t('missions.selectCollaborator')}
            </option>
            {collaborators.map((user) => (
              <option key={user.id} value={user.id}>
                {user.prenom || user.nom ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : user.username}
                {' · '}
                {user.username}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={t('missions.missionTitle')}
          required
          error={errors.title ? t(errors.title.message as string) : undefined}
        >
          <Input {...register('title')} placeholder={t('missions.titlePlaceholder')} />
        </Field>

        <Field
          label={t('missions.scheduledAt')}
          error={errors.scheduledAt ? t(errors.scheduledAt.message as string) : undefined}
        >
          <Input type="datetime-local" {...register('scheduledAt')} />
        </Field>

        <Field label={t('missions.description')}>
          <Textarea
            {...register('description')}
            rows={3}
            placeholder={t('missions.descriptionPlaceholder')}
          />
        </Field>
      </form>
    </Dialog>
  )
}
