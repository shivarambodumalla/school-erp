import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkSectionHasNoActiveStudents, handleDependencyError } from '@/lib/dependency-checks'

type RouteContext = { params: Promise<{ classYearId: string; sectionId: string }> }

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId, sectionId } = await context.params
    const body = await req.json() as {
      name?: string
      maxStrength?: number
      classTeacherId?: string | null
    }

    const section = await prisma.section.findFirst({
      where: { id: sectionId, classYearId, institutionId },
    })
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.maxStrength !== undefined) data.maxStrength = body.maxStrength
    if (body.classTeacherId !== undefined) data.classTeacherId = body.classTeacherId

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/school/classes/[classYearId]/sections/[sectionId] error:', err)
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
    const { classYearId, sectionId } = await context.params

    const section = await prisma.section.findFirst({
      where: { id: sectionId, classYearId, institutionId },
    })
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    try { await checkSectionHasNoActiveStudents(sectionId) }
    catch (e) { return handleDependencyError(e) }

    await prisma.section.delete({ where: { id: sectionId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/classes/[classYearId]/sections/[sectionId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
