import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string; subjectId: string }> }

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
    const { classYearId, subjectId } = await context.params
    const body = await req.json() as {
      name?: string
      code?: string
      weeklyPeriods?: number
      hasOnlineContent?: boolean
      canPreviewFiles?: boolean
      canDownloadFiles?: boolean
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, classYearId, institutionId },
    })
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.code !== undefined) data.code = body.code
    if (body.weeklyPeriods !== undefined) data.weeklyPeriods = body.weeklyPeriods
    if (body.hasOnlineContent !== undefined) data.hasOnlineContent = body.hasOnlineContent
    if (body.canPreviewFiles !== undefined) data.canPreviewFiles = body.canPreviewFiles
    if (body.canDownloadFiles !== undefined) data.canDownloadFiles = body.canDownloadFiles

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/school/classes/[classYearId]/subjects/[subjectId] error:', err)
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
    const { classYearId, subjectId } = await context.params

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, classYearId, institutionId },
      include: {
        _count: { select: { posts: true, gradeEntries: true } },
      },
    })
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    if (subject._count.posts > 0 || subject._count.gradeEntries > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subject with existing posts or grade entries' },
        { status: 400 }
      )
    }

    // Delete related SubjectTeacher records first
    await prisma.subjectTeacher.deleteMany({ where: { subjectId } })
    await prisma.subject.delete({ where: { id: subjectId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/classes/[classYearId]/subjects/[subjectId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
