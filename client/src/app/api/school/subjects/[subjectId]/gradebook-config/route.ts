import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { RoundingMethod } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/gradebook-config
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

  const config = await prisma.subjectGradebookConfig.findUnique({
    where: { subjectId },
  })

  if (!config) {
    // Return defaults
    return NextResponse.json({
      subjectId,
      weightageRules: [],
      passingPercent: 40,
      showWeightageToStudents: true,
      roundingMethod: 'NEAREST',
    })
  }

  return NextResponse.json(config)
}

// PATCH /api/school/subjects/[subjectId]/gradebook-config
export async function PATCH(req: Request, ctx: RouteContext) {
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
    weightageRules?: Array<{ category: string; weight: number }>
    passingPercent?: number
    showWeightageToStudents?: boolean
    roundingMethod?: string
  }

  const config = await prisma.subjectGradebookConfig.upsert({
    where: { subjectId },
    create: {
      subjectId,
      weightageRules: body.weightageRules ?? [],
      passingPercent: body.passingPercent ?? 40,
      showWeightageToStudents: body.showWeightageToStudents ?? true,
      roundingMethod: (body.roundingMethod as 'NEAREST' | 'FLOOR' | 'CEILING') ?? 'NEAREST',
    },
    update: {
      ...(body.weightageRules !== undefined && { weightageRules: body.weightageRules }),
      ...(body.passingPercent !== undefined && { passingPercent: body.passingPercent }),
      ...(body.showWeightageToStudents !== undefined && {
        showWeightageToStudents: body.showWeightageToStudents,
      }),
      ...(body.roundingMethod !== undefined && { roundingMethod: body.roundingMethod as RoundingMethod }),
    },
  })

  return NextResponse.json(config)
}
