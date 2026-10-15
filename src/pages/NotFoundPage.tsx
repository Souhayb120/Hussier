import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { PageHeader } from '../components/layout'
import { EmptyState, Card } from '../components/ui'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title="404" />
      <Card>
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title={t('notFound.title')}
          description={t('notFound.message')}
          action={
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('notFound.backHome')}
            </Link>
          }
        />
      </Card>
    </div>
  )
}