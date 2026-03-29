import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const studentSections = await prisma.studentSection.findMany({
      where: { classYearId, institutionId, status: 'ACTIVE' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            rollNo: true,
            photoUrl: true,
            serialNo: true,
          },
        },
        section: { select: { id: true, name: true } },
      },
      orderBy: { student: { firstName: 'asc' } },
    })

    return NextResponse.json(studentSections)
  } catch (err) {
    console.error('GET /api/school/classes/[classYearId]/promote error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface PromotionDecision {
  studentId: string
  status: 'PROMOTED' | 'DETAINED'
  toSectionId?: string
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params
    const body = await req.json() as { decisions: PromotionDecision[] }

    if (!body.decisions || !Array.isArray(body.decisions) || body.decisions.length === 0) {
      return NextResponse.json({ error: 'decisions array is required' }, { status: 400 })
    }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
      include: { classTemplate: true },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const results: { studentId: string; status: string; success: boolean; error?: string }[] = []

    for (const decision of body.decisions) {
      const studentSection = await prisma.studentSection.findUnique({
        where: {
          studentId_classYearId: { studentId: decision.studentId, classYearId },
        },
      })
      if (!studentSection || studentSection.institutionId !== institutionId) {
        results.push({
          studentId: decision.studentId,
          status: decision.status,
          success: false,
          error: 'Student section not found',
        })
        continue
      }

      if (decision.status === 'PROMOTED') {
        // Find the next ClassYear (gradeLevel + 1, same academic year)
        const nextClassYear = await prisma.classYear.findFirst({
          where: {
            institutionId,
            academicYearId: classYear.academicYearId,
            classTemplate: { gradeLevel: classYear.classTemplate.gradeLevel + 1 },
          },
          include: { sections: { take: 1 } },
        })

        if (!nextClassYear) {
          results.push({
            studentId: decision.studentId,
            status: decision.status,
            success: false,
            error: 'No next class year found for promotion',
          })
          continue
        }

        const targetSectionId = decision.toSectionId ?? nextClassYear.sections[0]?.id
        if (!targetSectionId) {
          results.push({
            studentId: decision.studentId,
            status: decision.status,
            success: false,
            error: 'No section available in next class year',
          })
          continue
        }

        // Create StudentSection in next class
        await prisma.studentSection.create({
          data: {
            institutionId,
            studentId: decision.studentId,
            sectionId: targetSectionId,
            classYearId: nextClassYear.id,
          },
        })

        // Create PromotionRecord
        await prisma.promotionRecord.create({
          data: {
            institutionId,
            studentId: decision.studentId,
            fromClassYearId: classYearId,
            fromSectionId: studentSection.sectionId,
            toClassYearId: nextClassYear.id,
            toSectionId: targetSectionId,
            status: 'PROMOTED',
            promotedById: ctx.userId,
          },
        })

        // Update current StudentSection status
        await prisma.studentSection.update({
          where: {
            studentId_classYearId: { studentId: decision.studentId, classYearId },
          },
          data: { status: 'PROMOTED', promotedAt: new Date() },
        })

        results.push({
          studentId: decision.studentId,
          status: 'PROMOTED',
          success: true,
        })
      } else if (decision.status === 'DETAINED') {
        // Create PromotionRecord with DETAINED status
        await prisma.promotionRecord.create({
          data: {
            institutionId,
            studentId: decision.studentId,
            fromClassYearId: classYearId,
            fromSectionId: studentSection.sectionId,
            status: 'DETAINED',
            promotedById: ctx.userId,
          },
        })

        // Update current StudentSection status
        await prisma.studentSection.update({
          where: {
            studentId_classYearId: { studentId: decision.studentId, classYearId },
          },
          data: { status: 'DETAINED' },
        })

        results.push({
          studentId: decision.studentId,
          status: 'DETAINED',
          success: true,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('POST /api/school/classes/[classYearId]/promote error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
