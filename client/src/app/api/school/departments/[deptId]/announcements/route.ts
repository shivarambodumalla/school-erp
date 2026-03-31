import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json
type Ctx = { params: Promise<{ deptId: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const announcements = await prisma.deptAnnouncement.findMany({
      where: { departmentId: deptId, institutionId },
      include: { createdBy: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return json(announcements)
  } catch (err) {
    console.error('GET /api/school/departments/[deptId]/announcements error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx
  const { deptId } = await params

  try {
    const { title, content } = await req.json() as { title: string; content: string }

    if (!title || !content) {
      return json({ error: 'Title and content are required' }, { status: 400 })
    }

    const announcement = await prisma.deptAnnouncement.create({
      data: {
        institutionId,
        departmentId: deptId,
        title,
        content,
        createdById: userId,
      },
      include: { createdBy: { select: { email: true } } },
    })

    return json(announcement, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/departments/[deptId]/announcements error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
