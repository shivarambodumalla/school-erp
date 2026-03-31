import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json
type Ctx = { params: Promise<{ deptId: string; annoId: string }> }

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, portalType, userId } = ctx
  const { deptId, annoId } = await params

  try {
    const announcement = await prisma.deptAnnouncement.findUnique({
      where: { id: annoId },
    })

    if (!announcement || announcement.departmentId !== deptId || announcement.institutionId !== institutionId) {
      return json({ error: 'Announcement not found' }, { status: 404 })
    }

    if (announcement.createdById !== userId && portalType !== 'ADMIN') {
      return json({ error: 'You can only delete your own announcements' }, { status: 403 })
    }

    await prisma.deptAnnouncement.delete({ where: { id: annoId } })

    return json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/school/departments/[deptId]/announcements/[annoId] error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
