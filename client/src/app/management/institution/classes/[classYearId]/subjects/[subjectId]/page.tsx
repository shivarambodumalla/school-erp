import { SubjectStream } from '@/features/subjects/components/SubjectStream'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectStreamPage({ params }: Props) {
  const { subjectId } = await params

  return <SubjectStream subjectId={subjectId} />
}
