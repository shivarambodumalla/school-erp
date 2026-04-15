import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { ReportCardDetail } from
  '@/features/report-cards/components/ReportCardDetail'

interface Props {
  params: { id: string }
}

export default async function ReportCardDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <ReportCardDetail generationId={params.id} />
}
