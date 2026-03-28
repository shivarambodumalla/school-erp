import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { RejectedAdmissionsClient } from
  '@/features/admissions/components/RejectedAdmissionsClient'

export default async function RejectedAdmissionsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <RejectedAdmissionsClient />
}
