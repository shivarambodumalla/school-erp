import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const kudos = await prisma.kudos.findMany({
    where: { institutionId, studentId: student.id },
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  // Calculate total points
  const totalPoints = kudos.reduce((sum, k) => sum + k.points, 0)

  // Count badges by type
  const badgeCounts: Record<string, number> = {}
  for (const k of kudos) {
    badgeCounts[k.badgeType] = (badgeCounts[k.badgeType] ?? 0) + 1
  }

  return NextResponse.json({ kudos, totalPoints, badgeCounts })
}
