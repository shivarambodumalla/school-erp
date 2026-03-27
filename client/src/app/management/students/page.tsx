import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StudentsBasicClient } from
  '@/features/students/components/StudentsBasicClient'

export default async function StudentsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Students
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All enrolled students in your institution
          </p>
        </div>
      </div>
      <StudentsBasicClient />
    </div>
  )
}