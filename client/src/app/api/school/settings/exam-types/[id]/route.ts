import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { id } = await ctx.params

  try {
    const existing = await prisma.examType.findFirst({
      where: { id, institutionId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Exam type not found' },
        { status: 404 },
      )
    }

    const body = await req.json() as {
      name?: string
      shortName?: string
      countInFinalGrade?: boolean
      weightage?: number
      order?: number
    }

    if (body.weightage !== undefined) {
      const others = await prisma.examType.findMany({
        where: { institutionId, id: { not: id } },
        select: { weightage: true },
      })
      const otherTotal = others.reduce(
        (s, e) => s + e.weightage, 0,
      )
      if (otherTotal + body.weightage > 100) {
        return NextResponse.json(
          { error: `Total weightage would be ${otherTotal + body.weightage}%, max 100%` },
          { status: 400 },
        )
      }
    }

    const updated = await prisma.examType.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.shortName !== undefined
          ? { shortName: body.shortName }
          : {}),
        ...(body.countInFinalGrade !== undefined
          ? { countInFinalGrade: body.countInFinalGrade }
          : {}),
        ...(body.weightage !== undefined
          ? { weightage: body.weightage }
          : {}),
        ...(body.order !== undefined ? { order: body.order } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH exam-type error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { id } = await ctx.params

  try {
    const existing = await prisma.examType.findFirst({
      where: { id, institutionId },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Exam type not found' },
        { status: 404 },
      )
    }

    const entriesCount = await prisma.gradeEntry.count({
      where: { examTypeId: id, institutionId },
    })
    if (entriesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${entriesCount} grade entries exist` },
        { status: 400 },
      )
    }

    await prisma.examType.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('DELETE exam-type error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
