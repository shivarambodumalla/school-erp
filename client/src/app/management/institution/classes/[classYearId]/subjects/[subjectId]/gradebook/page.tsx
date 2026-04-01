import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectGradebookPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return (
    <div className="rounded-xl border bg-card p-16 flex flex-col items-center justify-center gap-4 text-center">
      <p className="font-semibold">Gradebook coming soon</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        View and manage student grades for exams, assignments, and quizzes.
      </p>
    </div>
  )
}
