import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Mic, Square, X } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../Toast'
import { Button } from '../ui'
import { apiErrorKey } from '../../lib/format'

/** Au-delà, l'enregistrement s'arrête tout seul (le fichier reste petit). */
const MAX_SECONDS = 5 * 60

/** Le premier format que le navigateur sait enregistrer (Chrome/Android : webm, iPhone : mp4). */
function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Bouton « Dicter » : le collaborateur parle, le texte arrive dans le champ.
 * Le texte doit être relu avant d'enregistrer l'observation.
 */
export function VoiceDictation({
  missionId,
  onText,
}: {
  missionId: string
  onText: (text: string) => void
}) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  // false quand l'utilisateur annule : on jette l'audio au lieu de l'envoyer
  const keepRef = useRef(true)

  // Le micro n'existe qu'en HTTPS (ou localhost) et dans les navigateurs récents.
  const supported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  const transcribeM = useMutation({
    mutationFn: (audio: Blob) =>
      api.observations.transcribe(missionId, audio, `observation.${extensionFor(audio.type)}`),
    onSuccess: (result) => {
      if (!result.text) {
        toast(t('observations.voice.nothingHeard'), 'error')
        return
      }
      onText(result.text)
      toast(t('observations.voice.done'))
    },
    onError: (error) => toast(t(apiErrorKey(error)), 'error'),
  })

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = pickMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      chunksRef.current = []
      keepRef.current = true
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        releaseMic()
        setRecording(false)
        if (!keepRef.current) return
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' })
        if (audio.size > 0) transcribeM.mutate(audio)
      }

      recorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setRecording(true)
    } catch {
      releaseMic()
      toast(t('observations.voice.micDenied'), 'error')
    }
  }

  const stop = (keep: boolean) => {
    keepRef.current = keep
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  // Chronomètre.
  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [recording])

  // Arrêt automatique à 5 minutes (l'audio est envoyé).
  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stop(true)
  }, [recording, seconds])

  // Si on quitte la page pendant l'enregistrement : on coupe le micro sans rien envoyer.
  useEffect(() => {
    return () => {
      keepRef.current = false
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  if (!supported) {
    return <p className="text-xs text-ink-muted">{t('observations.voice.unsupported')}</p>
  }

  if (recording) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
        role="status"
      >
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </span>
        <span className="text-sm font-medium text-red-700">
          {t('observations.voice.recording')}{' '}
          <span className="tabnum" dir="ltr">
            {formatDuration(seconds)} / {formatDuration(MAX_SECONDS)}
          </span>
        </span>
        <div className="ms-auto flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={() => stop(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<Square className="h-4 w-4" />}
            onClick={() => stop(true)}
          >
            {t('observations.voice.stop')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<Mic className="h-4 w-4" />}
        loading={transcribeM.isPending}
        onClick={start}
      >
        {transcribeM.isPending ? t('observations.voice.working') : t('observations.voice.start')}
      </Button>
      <span className="text-xs text-ink-muted">{t('observations.voice.hint')}</span>
    </div>
  )
}
