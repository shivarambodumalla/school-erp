import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string; studentId: string }> }

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
