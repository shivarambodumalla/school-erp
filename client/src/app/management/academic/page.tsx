import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { AcademicTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/AcademicTab'

export default async function AcademicPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Classes, sections and timetable overview
        </p>
      </div>
      <AcademicTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
