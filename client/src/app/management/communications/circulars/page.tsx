import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { CircularsClient } from
  '@/features/communications/components/CircularsClient'

export default async function CircularsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <CircularsClient />
}
