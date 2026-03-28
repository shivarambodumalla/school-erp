import { GradebookClient } from
  '@/features/gradebook/components/GradebookClient'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectGradebookPage({ params }: Props) {
  const { subjectId } = await params
  return <GradebookClient subjectId={subjectId} />
}
