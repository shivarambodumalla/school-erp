import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ subjectId: string }> }

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json(
      { error: 'No institution' },
      { status: 400 }
    )
  }

  try {
    const { subjectId } = await context.params

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId },
      include: {
        classYear: {
          include: {
            classTemplate: true,
            academicYear: true,
          },
        },
        section: true,
        teachers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            gradeEntries: true,
          },
        },
      },
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subject)
  } catch (err) {
    console.error('GET /api/school/subjects/[subjectId]:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
