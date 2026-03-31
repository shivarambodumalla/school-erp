import { AssessmentsView } from
  '@/features/subjects/components/AssessmentsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function AssessmentsPage({ params }: Props) {
  const { subjectId } = await params
  return <AssessmentsView subjectId={subjectId} />
}
