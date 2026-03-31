import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { NotebookView } from '@/features/subjects/components/NotebookView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function NotebookPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    redirect('/auth/login')
  }

  const { subjectId } = await params

  return <NotebookView subjectId={subjectId} />
}
