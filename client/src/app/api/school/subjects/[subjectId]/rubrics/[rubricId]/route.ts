import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; rubricId: string }> }

// GET /api/school/subjects/[subjectId]/rubrics/[rubricId]
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, rubricId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const rubric = await prisma.rubric.findFirst({
    where: { id: rubricId, institutionId },
  })
  if (!rubric) {
    return NextResponse.json({ error: 'Rubric not found' }, { status: 404 })
  }

  return NextResponse.json(rubric)
}

// PATCH /api/school/subjects/[subjectId]/rubrics/[rubricId]
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, rubricId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.rubric.findFirst({
    where: { id: rubricId, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Rubric not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name?: string
    description?: string
    criteria?: Array<{ name: string; levels: Array<{ label: string; points: number; description: string }> }>
    isShared?: boolean
  }

  const updated = await prisma.rubric.update({
    where: { id: rubricId },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.criteria !== undefined && { criteria: body.criteria }),
      ...(body.isShared !== undefined && { isShared: body.isShared }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/school/subjects/[subjectId]/rubrics/[rubricId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, rubricId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.rubric.findFirst({
    where: { id: rubricId, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Rubric not found' }, { status: 404 })
  }

  await prisma.rubric.delete({ where: { id: rubricId } })

  return NextResponse.json({ success: true })
}
