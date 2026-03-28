import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ subjectId: string; quizId: string }>
}

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { quizId } = await ctx.params
  const institutionId = session.user.institutionId

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        select: {
          id: true, type: true, text: true,
          options: true, marks: true, order: true,
        },
      },
    },
  })
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const existing = await prisma.quizAttempt.findUnique({
    where: { quizId_studentId: { quizId, studentId: student.id } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Attempt already started' },
      { status: 409 },
    )
  }

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, studentId: student.id },
  })

  return NextResponse.json({
    attemptId: attempt.id,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions,
  })
}

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { quizId } = await ctx.params
  const institutionId = session.user.institutionId
  const body = (await req.json()) as {
    attemptId: string
    answers: Record<string, string | string[]>
  }

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  })
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  let score = 0
  for (const q of quiz.questions) {
    const answer = body.answers[q.id]
    if (!answer || !q.correctAnswer) continue
    if (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'SHORT') {
      const studentAns = Array.isArray(answer) ? answer[0] : answer
      if (studentAns?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        score += q.marks
      }
    }
  }

  const now = new Date()
  const attempt = await prisma.quizAttempt.update({
    where: { id: body.attemptId },
    data: {
      answers: body.answers,
      score,
      submittedAt: now,
      timeTaken: undefined,
    },
  })

  const showResults = quiz.showResultsAfter
  return NextResponse.json({
    attemptId: attempt.id,
    score: showResults ? score : null,
    totalMarks: showResults ? quiz.totalMarks : null,
    submitted: true,
  })
}
