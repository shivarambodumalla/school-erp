import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ subjectId: string }>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { subjectId } = await ctx.params
  const institutionId = session.user.institutionId

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const section = await prisma.studentSection.findFirst({
    where: { studentId: student.id, institutionId, status: 'ACTIVE' },
  })
  if (!section) {
    return NextResponse.json({ error: 'No active enrollment' }, { status: 404 })
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const now = new Date()
  const posts = await prisma.subjectPost.findMany({
    where: {
      subjectId,
      institutionId,
      isPublished: true,
      AND: [
        { OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
        { OR: [{ sectionId: null }, { sectionId: section.sectionId }] },
      ],
    },
    include: {
      attachments: true,
      assignment: true,
      quiz: { include: { questions: { select: { id: true, type: true, text: true, options: true, marks: true, order: true } } } },
      poll: true,
      homeworkLogs: { where: { sectionId: section.sectionId } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const postIds = posts.map((p) => p.id)
  const assignmentIds = posts
    .filter((p) => p.assignment)
    .map((p) => p.assignment!.id)
  const quizIds = posts.filter((p) => p.quiz).map((p) => p.quiz!.id)
  const pollIds = posts.filter((p) => p.poll).map((p) => p.poll!.id)
  const homeworkIds = posts
    .flatMap((p) => p.homeworkLogs)
    .map((h) => h.id)

  const [submissions, attempts, votes, completions] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: { studentId: student.id, assignmentId: { in: assignmentIds } },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId: student.id, quizId: { in: quizIds } },
    }),
    prisma.pollVote.findMany({
      where: { studentId: student.id, pollId: { in: pollIds } },
    }),
    prisma.homeworkCompletion.findMany({
      where: { studentId: student.id, homeworkId: { in: homeworkIds } },
    }),
  ])

  const subMap = Object.fromEntries(submissions.map((s) => [s.assignmentId, s]))
  const attMap = Object.fromEntries(attempts.map((a) => [a.quizId, a]))
  const voteMap = Object.fromEntries(votes.map((v) => [v.pollId, v]))
  const hwMap = Object.fromEntries(completions.map((c) => [c.homeworkId, c]))

  void postIds

  const result = posts.map((post) => ({
    id: post.id,
    type: post.type,
    title: post.title,
    description: post.description,
    topicTag: post.topicTag,
    createdAt: post.createdAt,
    attachments: post.attachments,
    assignment: post.assignment
      ? {
          ...post.assignment,
          submission: subMap[post.assignment.id] ?? null,
        }
      : null,
    quiz: post.quiz
      ? {
          id: post.quiz.id,
          totalMarks: post.quiz.totalMarks,
          timeLimit: post.quiz.timeLimit,
          attemptsAllowed: post.quiz.attemptsAllowed,
          questionCount: post.quiz.questions.length,
          attempt: attMap[post.quiz.id] ?? null,
        }
      : null,
    poll: post.poll
      ? {
          ...post.poll,
          vote: voteMap[post.poll.id] ?? null,
        }
      : null,
    homework: post.homeworkLogs[0]
      ? {
          ...post.homeworkLogs[0],
          completion: hwMap[post.homeworkLogs[0].id] ?? null,
        }
      : null,
  }))

  return NextResponse.json({ posts: result, studentId: student.id })
}
