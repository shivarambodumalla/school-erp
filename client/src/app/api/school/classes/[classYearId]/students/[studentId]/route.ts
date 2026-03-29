import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string; studentId: string }> }

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId, studentId } = await context.params
    const body = await req.json() as { sectionId: string }

    if (!body.sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }

    const studentSection = await prisma.studentSection.findUnique({
      where: { studentId_classYearId: { studentId, classYearId } },
    })
    if (!studentSection || studentSection.institutionId !== institutionId) {
      return NextResponse.json({ error: 'Student section not found' }, { status: 404 })
    }

    const updated = await prisma.studentSection.update({
      where: { studentId_classYearId: { studentId, classYearId } },
      data: { sectionId: body.sectionId },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/school/classes/[classYearId]/students/[studentId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId, studentId } = await context.params

    const studentSection = await prisma.studentSection.findUnique({
      where: { studentId_classYearId: { studentId, classYearId } },
    })
    if (!studentSection || studentSection.institutionId !== institutionId) {
      return NextResponse.json({ error: 'Student section not found' }, { status: 404 })
    }

    await prisma.studentSection.update({
      where: { studentId_classYearId: { studentId, classYearId } },
      data: { status: 'TRANSFERRED' },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/classes/[classYearId]/students/[studentId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
