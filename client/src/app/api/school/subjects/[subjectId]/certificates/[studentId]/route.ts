import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; studentId: string }> }

// GET /api/school/subjects/[subjectId]/certificates/[studentId]
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, studentId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const certificate = await prisma.subjectCertificate.findUnique({
    where: { subjectId_studentId: { subjectId, studentId } },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  })

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  return NextResponse.json(certificate)
}
