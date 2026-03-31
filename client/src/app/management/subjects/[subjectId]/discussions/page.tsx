import { DiscussionsView } from
  '@/features/subjects/components/DiscussionsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function DiscussionsPage({ params }: Props) {
  const { subjectId } = await params
  return <DiscussionsView subjectId={subjectId} />
}
