import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StudentsBasicClient } from
  '@/features/students/components/StudentsBasicClient'

export default async function StudentsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <StudentsBasicClient />
}