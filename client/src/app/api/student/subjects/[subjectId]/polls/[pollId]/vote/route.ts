import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ subjectId: string; pollId: string }>
}

export async function POST(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { pollId } = await routeCtx.params
  const body = (await req.json()) as { optionIds: string[] }

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const poll = await prisma.poll.findUnique({ where: { id: pollId } })
  if (!poll) {
    return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
  }
  if (poll.closedAt && new Date() > poll.closedAt) {
    return NextResponse.json({ error: 'Poll closed' }, { status: 400 })
  }

  const existing = await prisma.pollVote.findUnique({
    where: { pollId_studentId: { pollId, studentId: student.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 409 })
  }

  await prisma.pollVote.create({
    data: {
      pollId,
      studentId: student.id,
      optionIds: body.optionIds,
    },
  })

  const allVotes = await prisma.pollVote.findMany({ where: { pollId } })
  const counts: Record<string, number> = {}
  for (const v of allVotes) {
    const ids = v.optionIds as string[]
    for (const id of ids) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }

  return NextResponse.json({
    totalVotes: allVotes.length,
    counts,
  })
}
