import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { MeritListDetail } from '@/features/admissions/components/MeritListDetail'

interface Props {
  params: { id: string }
}

export default async function MeritListDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <MeritListDetail configId={params.id} />
}
