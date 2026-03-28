import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ subjectId: string; pollId: string }>
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { pollId } = await ctx.params
  const institutionId = session.user.institutionId
  const body = (await req.json()) as { optionIds: string[] }

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
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
