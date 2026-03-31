import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/rubrics
export async function GET(req: Request, ctx: RouteContext) {
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

  // Return rubrics for this subject + shared institution rubrics
  const rubrics = await prisma.rubric.findMany({
    where: {
      institutionId,
      OR: [{ subjectId }, { isShared: true }],
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(rubrics)
}

// POST /api/school/subjects/[subjectId]/rubrics
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name: string
    description?: string
    criteria?: Array<{ name: string; levels: Array<{ label: string; points: number; description: string }> }>
    isShared?: boolean
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const rubric = await prisma.rubric.create({
    data: {
      institutionId,
      subjectId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      criteria: body.criteria ?? [],
      isShared: body.isShared ?? false,
      createdById: userId,
    },
  })

  return NextResponse.json(rubric, { status: 201 })
}
