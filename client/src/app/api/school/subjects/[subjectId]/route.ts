import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ subjectId: string }> }

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
    if (false
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

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
