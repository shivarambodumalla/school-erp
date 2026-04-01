import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassAttendancePage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return (
    <div className="px-4 md:px-6 py-4 space-y-4">
      <h2 className="text-lg font-semibold">Attendance</h2>
      <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
        Attendance module coming soon
      </div>
    </div>
  )
}
