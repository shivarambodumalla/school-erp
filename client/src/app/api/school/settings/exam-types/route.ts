import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const examTypes = await prisma.examType.findMany({
      where: { institutionId },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(examTypes)
  } catch (err) {
    console.error('GET exam-types error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const body = await req.json() as {
      name: string
      shortName: string
      countInFinalGrade?: boolean
      weightage?: number
      order?: number
    }

    if (!body.name || !body.shortName) {
      return NextResponse.json(
        { error: 'name and shortName are required' },
        { status: 400 },
      )
    }

    const existing = await prisma.examType.findMany({
      where: { institutionId },
      select: { weightage: true },
    })
    const currentTotal = existing.reduce(
      (s, e) => s + e.weightage, 0,
    )
    const newWeight = body.weightage ?? 0
    if (currentTotal + newWeight > 100) {
      return NextResponse.json(
        { error: `Total weightage would be ${currentTotal + newWeight}%, max 100%` },
        { status: 400 },
      )
    }

    const examType = await prisma.examType.create({
      data: {
        institutionId,
        name: body.name,
        shortName: body.shortName,
        countInFinalGrade: body.countInFinalGrade ?? true,
        weightage: newWeight,
        order: body.order ?? 0,
      },
    })

    return NextResponse.json(examType, { status: 201 })
  } catch (err) {
    console.error('POST exam-types error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
