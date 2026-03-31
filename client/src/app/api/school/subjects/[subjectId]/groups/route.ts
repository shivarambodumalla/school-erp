import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/groups — list group sets
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const groupSets = await prisma.groupSet.findMany({
    where: { subjectId, institutionId },
    include: {
      groups: {
        include: {
          members: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true, rollNo: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(groupSets)
}

// POST /api/school/subjects/[subjectId]/groups — create a group set
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name: string
    assignmentType?: string
    minSize?: number
    maxSize?: number
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const groupSet = await prisma.groupSet.create({
    data: {
      subjectId,
      institutionId,
      name: body.name.trim(),
      assignmentType: (body.assignmentType as 'RANDOM' | 'SELF_SELECT' | 'MANUAL') ?? 'MANUAL',
      minSize: body.minSize ?? 2,
      maxSize: body.maxSize ?? 5,
    },
    include: { groups: true },
  })

  return NextResponse.json(groupSet, { status: 201 })
}
