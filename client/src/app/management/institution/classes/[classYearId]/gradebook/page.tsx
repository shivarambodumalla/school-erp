import { ClassGradebookClient } from
  '@/features/gradebook/components/ClassGradebookClient'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassGradebookPage({ params }: Props) {
  const { classYearId } = await params
  return <ClassGradebookClient classYearId={classYearId} />
}
