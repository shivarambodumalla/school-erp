import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { QuizBuilderClient } from '@/features/subjects/components/QuizBuilderClient'
import type {
  QuizWithQuestions,
  QuizQuestionData,
} from '@/features/subjects/types'

interface Props {
  params: Promise<{ subjectId: string; postId: string }>
}

export default async function QuizPage({ params }: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId
  const { subjectId, postId } = await params

  const post = await prisma.subjectPost.findFirst({
    where: { id: postId, subjectId, institutionId },
    include: {
      quiz: {
        include: {
          questions: { orderBy: { order: 'asc' } },
          _count: { select: { attempts: true } },
        },
      },
    },
  })

  if (!post || !post.quiz) {
    redirect(`/management/subjects/${subjectId}`)
  }

  const questions: QuizQuestionData[] =
    post.quiz.questions.map((q) => ({
      id: q.id,
      quizId: q.quizId,
      type: q.type,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      order: q.order,
      explanation: q.explanation,
    }))

  const quiz: QuizWithQuestions = {
    id: post.quiz.id,
    totalMarks: post.quiz.totalMarks,
    timeLimit: post.quiz.timeLimit,
    shuffleQuestions: post.quiz.shuffleQuestions,
    showResultsAfter: post.quiz.showResultsAfter,
    attemptsAllowed: post.quiz.attemptsAllowed,
    _count: post.quiz._count,
    questions,
  }

  return (
    <QuizBuilderClient
      subjectId={subjectId}
      postId={postId}
      postTitle={post.title}
      quiz={quiz}
    />
  )
}
