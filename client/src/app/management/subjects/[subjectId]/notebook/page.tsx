import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { NotebookView } from '@/features/subjects/components/NotebookView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function NotebookPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    redirect('/auth/login')
  }

  const { subjectId: rawId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return <NotebookView subjectId={subjectId} />
}
