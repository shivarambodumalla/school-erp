import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string; sectionId: string }> }

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

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
  _req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const { classYearId, sectionId } = await context.params

    const section = await prisma.section.findFirst({
      where: { id: sectionId, classYearId, institutionId },
      include: { _count: { select: { students: true } } },
    })
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    if (section._count.students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete section with enrolled students' },
        { status: 400 }
      )
    }

    await prisma.section.delete({ where: { id: sectionId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/classes/[classYearId]/sections/[sectionId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
