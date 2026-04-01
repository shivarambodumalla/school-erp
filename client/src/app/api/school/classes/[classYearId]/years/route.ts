import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { classYearId } = await context.params

  const classYear = await prisma.classYear.findFirst({
    where: { id: classYearId, institutionId },
    select: { classTemplateId: true },
  })
  if (!classYear) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const years = await prisma.classYear.findMany({
    where: { institutionId, classTemplateId: classYear.classTemplateId },
    select: {
      id: true,
      serialNo: true,
      status: true,
      academicYear: { select: { id: true, name: true, isCurrent: true } },
    },
    orderBy: { academicYear: { startDate: 'desc' } },
  })

  return NextResponse.json(years.map(y => ({
    classYearId: y.id,
    serialNo: y.serialNo,
    academicYearName: y.academicYear.name,
    isCurrent: y.academicYear.isCurrent,
    status: y.status,
  })))
}
