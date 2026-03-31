import { SubjectClasswork } from '@/features/subjects/components/SubjectClasswork'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectClassworkPage({ params }: Props) {
  const { subjectId } = await params

  return <SubjectClasswork subjectId={subjectId} />
}
