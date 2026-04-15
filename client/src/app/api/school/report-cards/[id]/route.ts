import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const generation = await prisma.reportCardGeneration.findFirst({
    where: { id, institutionId },
    include: {
      classYear: {
        include: {
          classTemplate: { select: { name: true } },
        },
      },
      academicYear: { select: { id: true, name: true } },
      cards: {
        orderBy: { student: { firstName: 'asc' } },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rollNo: true,
              admissionNo: true,
            },
          },
        },
      },
    },
  })

  if (!generation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(generation)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.reportCardGeneration.findFirst({
    where: { id, institutionId },
    select: { id: true, status: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Can only update report card config in DRAFT status' },
      { status: 400 },
    )
  }

  const body = (await req.json()) as Record<string, unknown>

  const allowedFields = [
    'examTypeIds', 'includeAttendance', 'includeRemarks', 'gradingScale',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = body[key]
    }
  }

  const updated = await prisma.reportCardGeneration.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}
