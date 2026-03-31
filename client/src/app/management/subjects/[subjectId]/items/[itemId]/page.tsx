import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
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

  const { subjectId, itemId } = await params

  return (
    <ItemDetailClient
      subjectId={subjectId}
      itemId={itemId}
      portalType={session.user.portalType}
    />
  )
}
