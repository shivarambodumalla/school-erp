import { SubjectGradesView } from
  '@/features/subjects/components/SubjectGradesView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectGradesPage({ params }: Props) {
  const { subjectId } = await params
  return <SubjectGradesView subjectId={subjectId} />
}
