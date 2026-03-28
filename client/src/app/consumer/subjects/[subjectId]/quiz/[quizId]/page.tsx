import { QuizTakingClient } from '@/features/student/components/QuizTakingClient'

interface PageProps {
  params: Promise<{ subjectId: string; quizId: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { subjectId, quizId } = await params
  return <QuizTakingClient subjectId={subjectId} quizId={quizId} />
}
