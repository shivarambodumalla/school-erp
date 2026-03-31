import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { DepartmentsClient } from '@/features/departments/components/DepartmentsClient'

export default async function DepartmentsPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <DepartmentsClient />
}
