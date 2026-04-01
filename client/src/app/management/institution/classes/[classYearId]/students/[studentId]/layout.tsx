import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { ClassTabBar } from '@/features/classes/components/ClassTabBar'
import { StudentSubTabBar } from '@/features/classes/components/StudentSubTabBar'
import { EnsureTabSync } from '@/features/classes/components/EnsureTabSync'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string; studentId: string }>
  children: ReactNode
}

export default async function StudentDetailLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  const portal = session.user.portalType
  if (portal !== 'ADMIN' && portal !== 'TEACHER') redirect('/management/dashboard')

  const { classYearId: rawId, studentId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return (
    <div className="space-y-0">
      <EnsureTabSync
        classYearId={classYearId}
        type="student"
        item={{ id: studentId, name: `Student #${studentId.slice(0, 6)}` }}
      />
      <ClassTabBar classYearId={classYearId} type="student" activeId={studentId} />
      <StudentSubTabBar classYearId={classYearId} studentId={studentId} />
      <div className="pt-4">{children}</div>
    </div>
  )
}
