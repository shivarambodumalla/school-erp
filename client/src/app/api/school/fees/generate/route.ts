import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as {
    feeCategoryId: string; month?: number; year?: number
    dueDate: string; studentIds?: string[]
  }

  const category = await prisma.feeCategory.findUnique({
    where: { id: body.feeCategoryId },
  })
  if (!category || category.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  // Get eligible students
  let studentIds: string[] = []

  if (body.studentIds?.length) {
    studentIds = body.studentIds
  } else if (category.applicableTo === 'ALL') {
    const students = await prisma.student.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: { id: true },
    })
    studentIds = students.map(s => s.id)
  } else if (category.applicableTo === 'CLASS') {
    const sections = await prisma.studentSection.findMany({
      where: { institutionId, classYearId: { in: category.classYearIds }, status: 'ACTIVE' },
      select: { studentId: true },
    })
    studentIds = Array.from(new Set(sections.map(s => s.studentId)))
  } else if (category.applicableTo === 'SECTION') {
    const sections = await prisma.studentSection.findMany({
      where: { institutionId, sectionId: { in: category.sectionIds }, status: 'ACTIVE' },
      select: { studentId: true },
    })
    studentIds = Array.from(new Set(sections.map(s => s.studentId)))
  }

  const dueDate = new Date(body.dueDate)
  let generated = 0
  let skipped = 0

  for (const studentId of studentIds) {
    const exists = await prisma.feePayment.findFirst({
      where: {
        studentId,
        feeCategoryId: body.feeCategoryId,
        month: body.month ?? null,
        year: body.year ?? null,
      },
    })
    if (exists) { skipped++; continue }

    await prisma.feePayment.create({
      data: {
        institutionId,
        studentId,
        feeCategoryId: body.feeCategoryId,
        amount: category.amount,
        fineAmount: 0,
        totalAmount: category.amount,
        status: 'PENDING',
        dueDate,
        month: body.month ?? null,
        year: body.year ?? null,
      },
    })
    generated++
  }

  return NextResponse.json({ generated, skipped })
}