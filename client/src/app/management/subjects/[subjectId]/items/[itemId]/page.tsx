import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { ItemDetailClient } from '@/features/subjects/components/items/ItemDetailClient'

interface Props {
  params: Promise<{ subjectId: string; itemId: string }>
}

export default async function ItemDetailPage({
  params,
}: Props) {
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

  const { subjectId: rawId, itemId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return (
    <ItemDetailClient
      subjectId={subjectId}
      itemId={itemId}
      portalType={session.user.portalType}
    />
  )
}
